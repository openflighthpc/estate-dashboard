import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import * as style from './ResourceAssignment.module.css';

function AssignedResource({ resourceName, noSlots, unassigned, onInputChange, onSlotIncrease, onSlotDecrease, isBurst }) {
  return (
    <p>
      <strong>{resourceName}{isBurst ? ' burst' : ''}</strong>
      No.slots:
      <input id="name" type="text" value={noSlots} onChange={onInputChange} />
      <button
        disabled = {unassigned <= 0}
        onClick={onSlotIncrease}
      >+</button>
      <button
        disabled = {noSlots <= 0}
        onClick={onSlotDecrease}
      >-</button>
    </p>
  );
}

const ResourceAssignment = (props) => {

  const [groups, setGroups] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [assignedSlots, setAssignedSlots] = useState([]);
  const [initialAssignments, setInitialAssignment] = useState([]);
  const organisationId = new URLSearchParams(window.location.search).get('organisation_id');

  useEffect(() => {
    fetchData();
    setInitialData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/assignment/raw-data?' + new URLSearchParams({
        organisation_id: organisationId,
      }).toString());
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setGroups(data.resourceGroups);
      setResources(data.assignments);
      setAssignedSlots(data.assignments.map((res) => res.assignments));
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  const setInitialData = async () => {
    try {
      const response = await fetch('/assignment/raw-data?' + new URLSearchParams({
        organisation_id: organisationId,
      }).toString());
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setInitialAssignment(data.assignments.map((res) => res.assignments));
      setLoadingInitial(false);
    } catch (error) {
      setError(error.message);
      setLoadingInitial(false);
    }
  };

  function assignmentType(isBurst = false) {
    return isBurst ? 'burst' : 'dedicated';
  }

  function unassignedSlots(index) {
    let assigned = [...assignedSlots][index];
    const totalSlots = resources[index].totalSlots;
    const totalAssignedSlots = assigned.map((a) => a.assignedSlots.dedicated + a.assignedSlots.burst).reduce((partialSum, a) => partialSum + a, 0);
    return totalSlots - totalAssignedSlots;
  }

  function handleInputChange(e, groupId, resourceIndex, isBurst) {
    if (e.target.value >= 0) {
      const currentAssignments = assignedSlots[resourceIndex].find((g) => g.groupId === groupId).assignedSlots[assignmentType(isBurst)];
      const maxSlots = unassignedSlots(resourceIndex) + currentAssignments;
      if ( e.target.value <= maxSlots) {
        let newAssigned = [...assignedSlots];
        newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots[assignmentType(isBurst)] = Number(e.target.value);
        setAssignedSlots(newAssigned);
      }
    }
  }
  function handleIncrease(groupId, resourceIndex, isBurst) {
    let newAssigned = [...assignedSlots];
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots[assignmentType(isBurst)] += 1;
    setAssignedSlots(newAssigned);
  }
  function handleDecrease(groupId, resourceIndex, isBurst) {
    let newAssigned = [...assignedSlots];
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots[assignmentType(isBurst)] -= 1;
    setAssignedSlots(newAssigned);
  }

  function anyChanges() {
    for (let i = 0; i < groups.length; i++) {
      if (changesForGroup(i).length > 0) {
        return true;
      }
    }
    return false;
  }

  function changesForGroup(groupIndex) {
    const groupId = groups[groupIndex].id;
    let changedAssignments = [];
    for (let i = 0; i < resources.length; i++) {
      const initiallyAssigned = initialAssignments[i].find((g) => g.groupId === groupId).assignedSlots;
      const nowAssigned = assignedSlots[i].find((g) => g.groupId === groupId).assignedSlots;
      if (initiallyAssigned !== nowAssigned) {
        if (initiallyAssigned.dedicated !== nowAssigned.dedicated) {
          changedAssignments.push(
            {
              resourceIndex: i,
              resourceId: resources[i].id,
              initiallyAssigned: initiallyAssigned.dedicated,
              nowAssigned: nowAssigned.dedicated,
              isBurst: false,
            }
          )
        }
        if (initiallyAssigned.burst !== nowAssigned.burst) {
          changedAssignments.push(
            {
              resourceIndex: i,
              resourceId: resources[i].id,
              initiallyAssigned: initiallyAssigned.burst,
              nowAssigned: nowAssigned.burst,
              isBurst: true,
            }
          )
        }
      }
    }
    return changedAssignments;
  }

  async function sendChanges() {
    try {
      let data = {
        organisationId: organisationId,
        changes: [],
      };
      for (let i = 0; i < groups.length; i++) {
        const changes = changesForGroup(i);
        if (changes.length > 0) {
          data.changes.push({ groupId: groups[i].id, changes: changes });
        }
      }
      const response = await fetch("send-message", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <>
      {loading || loadingInitial ? <p>loading</p> :
        <div className={style.pageGrid}>
          <div className={style.column}>
            <h1>Unassigned</h1>
            {resources.map((res, index) => (
              <p><strong>{res.name}</strong> No slots: {unassignedSlots(index)}</p>
            ))}
          </div>
          <div className={style.column}>
            <h1>Assigned</h1>
            <div>
              {
                groups.map(g => {
                  return (
                    <div className={style.groupCard}>
                      <h3>{g.name}</h3>
                      {
                        resources.map((r, index) => {
                          return (
                            <>
                              <AssignedResource
                                resourceName={r.name}
                                noSlots={assignedSlots[index].find((a) => a.groupId === g.id).assignedSlots.dedicated}
                                unassigned={unassignedSlots(index)}
                                onInputChange={(e) => handleInputChange(e, g.id, index)}
                                onSlotIncrease={() => handleIncrease(g.id, index)}
                                onSlotDecrease={() => handleDecrease(g.id, index)}
                                isBurst={false}
                              />
                              <AssignedResource
                                resourceName={r.name}
                                noSlots={assignedSlots[index].find((a) => a.groupId === g.id).assignedSlots.burst}
                                unassigned={unassignedSlots(index)}
                                onInputChange={(e) => handleInputChange(e, g.id, index, true)}
                                onSlotIncrease={() => handleIncrease(g.id, index, true)}
                                onSlotDecrease={() => handleDecrease(g.id, index, true)}
                                isBurst={true}
                              />
                            </>
                          )
                        })
                      }
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className={style.column}>
            <h1>Changes</h1>
            <div className={style.changes}>
              {
                groups.map((g, index) => {
                  if (changesForGroup(index).length > 0) {
                    return (
                      <>
                        <h3>{g.name}</h3>
                        {changesForGroup(index).map((change) => {
                          return (
                            <p>
                              {resources[change.resourceIndex].name} {change.isBurst ? 'burst' : ''}
                              <br/>
                              {change.initiallyAssigned} --> {change.nowAssigned}
                            </p>
                          )
                        })}
                      </>
                    )
                  }
                })
              }
            </div>
            <button
              className={style.requestButton}
              disabled={!anyChanges()}
              onClick={sendChanges}
            >
              Request changes
            </button>
          </div>
        </div>
      }
    </>
  );
};

ResourceAssignment.propTypes = {
  name: PropTypes.string.isRequired, // this is passed from the Rails view
};

export default ResourceAssignment;
