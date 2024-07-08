import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import * as style from './ResourceAssignment.module.css';

function AssignedResourceEditor({ assignmentType, noSlots, unassigned, onInputChange, onSlotIncrease, onSlotDecrease }) {
  return (
    <>
      <input id="name" type="text" value={noSlots} onChange={onInputChange} />
      <button
        disabled = {unassigned <= 0}
        onClick={onSlotIncrease}
      >+</button>
      <button
        disabled = {noSlots <= 0}
        onClick={onSlotDecrease}
      >-</button>
    </>
  );
}

const ResourceAssignment = (props) => {

  const [groups, setGroups] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [assignedSlots, setAssignedSlots] = useState([]);
  const [assignedBurstSlots, setAssignedBurstSlots] = useState([]);
  const [initialAssignments, setInitialAssignment] = useState([]);
  const [initialBurstAssignments, setInitialBurstAssignment] = useState([]);
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
      setAssignedSlots(data.assignments.dedicated.map((res) => res.assignments));
      setAssignedBurstSlots(data.assignments.burst.map((res) => res.assignments));
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
      setInitialAssignment(data.assignments.dedicated.map((res) => res.assignments));
      setInitialBurstAssignment(data.assignments.burst.map((res) => res.assignments));
      setLoadingInitial(false);
    } catch (error) {
      setError(error.message);
      setLoadingInitial(false);
    }
  };

  function assignmentType(isBurst = false) {
    return isBurst ? 'burst' : 'dedicated';
  }

  function unassignedSlots(index, isBurst = false) {
    let assigned;
    if (isBurst) {
      assigned = [...assignedBurstSlots][index];
    } else {
      assigned = [...assignedSlots][index];
    }
    const totalSlots = resources[assignmentType(isBurst)][index].totalSlots;
    const totalAssignedSlots = assigned.map((a) => a.assignedSlots).reduce((partialSum, a) => partialSum + a, 0);
    return totalSlots - totalAssignedSlots;
  }

  function handleInputChange(e, groupId, resourceIndex, isBurst) {
    if (e.target.value >= 0) {
      let assigned;
      if (isBurst) {
        assigned = [...assignedBurstSlots];
      } else {
        assigned = [...assignedSlots];
      }
      const currentAssignments = assigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots;
      const maxSlots = unassignedSlots(resourceIndex, isBurst) + currentAssignments;
      if ( e.target.value <= maxSlots) {
        let newAssigned = [...assigned];
        newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots = Number(e.target.value);
        if (isBurst) {
          setAssignedBurstSlots(newAssigned);
        } else {
          setAssignedSlots(newAssigned);
        }
      }
    }
  }
  function handleIncrease(groupId, resourceIndex, isBurst) {
    let newAssigned;
    if (isBurst) {
      newAssigned = [...assignedBurstSlots];
    } else {
      newAssigned = [...assignedSlots];
    }
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots += 1;
    if (isBurst) {
      setAssignedBurstSlots(newAssigned);
    } else {
      setAssignedSlots(newAssigned);
    }
  }
  function handleDecrease(groupId, resourceIndex, isBurst) {
    let newAssigned;
    if (isBurst) {
      newAssigned = [...assignedBurstSlots];
    } else {
      newAssigned = [...assignedSlots];
    }
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots -= 1;
    if (isBurst) {
      setAssignedBurstSlots(newAssigned);
    } else {
      setAssignedSlots(newAssigned);
    }
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
    for (let i = 0; i < resources.dedicated.length; i++) {
      const initiallyAssigned = initialAssignments[i].find((g) => g.groupId === groupId).assignedSlots;
      const nowAssigned = assignedSlots[i].find((g) => g.groupId === groupId).assignedSlots;
      if (initiallyAssigned !== nowAssigned) {
        changedAssignments.push(
          {
            resourceIndex: i,
            resourceId: resources.dedicated[i].id,
            initiallyAssigned: initiallyAssigned,
            nowAssigned: nowAssigned,
            isBurst: false,
          }
        )
      }
    }
    for (let i = 0; i < resources.burst.length; i++) {
      const initiallyAssigned = initialBurstAssignments[i].find((g) => g.groupId === groupId).assignedSlots;
      const nowAssigned = assignedBurstSlots[i].find((g) => g.groupId === groupId).assignedSlots;
      if (initiallyAssigned !== nowAssigned) {
        changedAssignments.push(
          {
            resourceIndex: i,
            resourceId: resources.burst[i].id,
            initiallyAssigned: initiallyAssigned,
            nowAssigned: nowAssigned,
            isBurst: true,
          }
        )
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
            <h3>Dedicated</h3>
            {resources.dedicated.map((res, index) => (
              <p><strong>{res.name}</strong> No slots: {unassignedSlots(index)}</p>
            ))}
            <h3>Burst</h3>
            {resources.burst.map((res, index) => (
              <p><strong>{res.name}</strong> No slots: {unassignedSlots(index, true)}</p>
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
                        resources.dedicated.map((r, index) => {
                          return (
                            <p>
                              <strong>{r.name}</strong>
                              <AssignedResourceEditor
                                noSlots={assignedSlots[index].find((a) => a.groupId === g.id).assignedSlots}
                                unassigned={unassignedSlots(index)}
                                onInputChange={(e) => handleInputChange(e, g.id, index)}
                                onSlotIncrease={() => handleIncrease(g.id, index)}
                                onSlotDecrease={() => handleDecrease(g.id, index)}
                              />
                            </p>
                          )
                        })
                      }
                      Burst: <br/>
                      {
                        resources.burst.map((r, index) => {
                          return (
                            <p>
                              <strong>{r.name}</strong>
                              <AssignedResourceEditor
                                noSlots={assignedBurstSlots[index].find((a) => a.groupId === g.id).assignedSlots}
                                unassigned={unassignedSlots(index, true)}
                                onInputChange={(e) => handleInputChange(e, g.id, index, true)}
                                onSlotIncrease={() => handleIncrease(g.id, index, true)}
                                onSlotDecrease={() => handleDecrease(g.id, index, true)}
                              />
                            </p>
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
                              {resources[assignmentType(change.isBurst)][change.resourceIndex].name} {change.isBurst ? 'burst' : ''}
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
