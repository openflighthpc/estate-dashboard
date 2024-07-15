import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import * as style from './ResourceAssignment.module.css';

function AssignedResourceEditor({ resourceName, noSlots, unassigned, onInputChange, onSlotIncrease, onSlotDecrease }) {
  return (
    <div className={[style.flexSpaceBetween, style.inputContainer].join(' ')}>
      {resourceName}
      <div className={style.flexSpaceBetween}>
        <input id="name" type="text" value={noSlots} onChange={onInputChange} />
        <div className={style.buttons}>
          <button
            disabled={unassigned <= 0}
            onClick={onSlotIncrease}
          >
            <span>+</span>
          </button>
          <button
            disabled={noSlots <= 0}
            onClick={onSlotDecrease}
          >
            <span>-</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const ResourceAssignment = (props) => {

  const [groups, setGroups] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [assignedSlots, setAssignedSlots] = useState([]);
  const [pendingAssignedSlots, setPendingAssignedSlots] = useState([]);
  const [actualAssignments, setActualAssignment] = useState([]);
  const [requestResponse, setRequestResponse] = useState("");
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
      setAssignedSlots(data.pendingAssignments);
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
      setActualAssignment({
        dedicated: data.assignments.dedicated.map((res) => res.assignments),
        burst: data.assignments.burst.map((res) => res.assignments),
      });
      setPendingAssignedSlots(data.pendingAssignments);
      setLoadingInitial(false);
    } catch (error) {
      setError(error.message);
      setLoadingInitial(false);
    }
  };

  function assignmentType(isBurst = false) {
    return isBurst ? 'burst' : 'dedicated';
  }

  function groupTotalAssignedSlots(groupId) {
    const assignedDedicated = assignedSlots.dedicated.map((res) => res.find((g) => g.groupId === groupId).assignedSlots);
    const assignedBurst = assignedSlots.burst.map((res) => res.find((g) => g.groupId === groupId).assignedSlots);
    return assignedDedicated.concat(assignedBurst).reduce((partialSum, a) => partialSum + a, 0);
  }

  function totalUnassignedSlots() {
    let unassigned = resources.dedicated.map((res, index) => unassignedSlots(index));
    unassigned.push(...resources.burst.map((res, index) => unassignedSlots(index, true)));
    return unassigned.reduce((partialSum, a) => partialSum + a, 0);
  }

  function unassignedSlots(index, isBurst = false) {
    let assigned = assignedSlots[assignmentType(isBurst)][index];
    const totalSlots = resources[assignmentType(isBurst)][index].totalSlots;
    const totalAssignedSlots = assigned.map((a) => a.assignedSlots).reduce((partialSum, a) => partialSum + a, 0);
    return totalSlots - totalAssignedSlots;
  }

  function handleInputChange(e, groupId, resourceIndex, isBurst) {
    if (e.target.value >= 0) {
      const currentAssignments = assignedSlots[assignmentType(isBurst)][resourceIndex].find((g) => g.groupId === groupId).assignedSlots;
      const maxSlots = unassignedSlots(resourceIndex, isBurst) + currentAssignments;
      if (e.target.value <= maxSlots) {
        let newAssigned = { ...assignedSlots };
        newAssigned[assignmentType(isBurst)][resourceIndex].find((g) => g.groupId === groupId).assignedSlots = Number(e.target.value);
        setAssignedSlots(newAssigned);
      }
    }
  }
  function handleIncrease(groupId, resourceIndex, isBurst) {
    let newAssigned = { ...assignedSlots };
    newAssigned[assignmentType(isBurst)][resourceIndex].find((g) => g.groupId === groupId).assignedSlots += 1;
    setAssignedSlots(newAssigned);
  }
  function handleDecrease(groupId, resourceIndex, isBurst) {
    let newAssigned = { ...assignedSlots };
    newAssigned[assignmentType(isBurst)][resourceIndex].find((g) => g.groupId === groupId).assignedSlots -= 1;
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
    for (let i = 0; i < resources.dedicated.length; i++) {
      const initiallyAssigned = actualAssignments.dedicated[i].find((g) => g.groupId === groupId).assignedSlots;
      const nowAssigned = assignedSlots.dedicated[i].find((g) => g.groupId === groupId).assignedSlots;
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
      const initiallyAssigned = actualAssignments.burst[i].find((g) => g.groupId === groupId).assignedSlots;
      const nowAssigned = assignedSlots.burst[i].find((g) => g.groupId === groupId).assignedSlots;
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
      setRequestResponse(json.result);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <>
      {loading || loadingInitial ? <p>loading</p> :
        <div className={style.pageGrid}>
          <div className={style.column}>
            <div className={[style.flexSpaceBetween, style.header].join(' ')}>
              <h3>Unassigned</h3>
              <span>{totalUnassignedSlots()} slots</span>
            </div>
            {console.log(pendingAssignedSlots)}
            {console.log(assignedSlots)}
            <div className={style.scrollContainer}>
              <div className={[style.resourcesContainer, style.unassigned].join(' ')}>
                {resources.dedicated.map((res, index) => (
                  <div className={style.flexSpaceBetween}>
                    <span>{res.name}</span>
                    <span>{unassignedSlots(index)}</span>
                  </div>
                ))}
                <strong>Burst</strong>
                {resources.burst.map((res, index) => (
                  <div className={style.flexSpaceBetween}>
                    <span>{res.name}</span>
                    <span>{unassignedSlots(index, true)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={style.column}>
            <div className={style.scrollContainer}>
              {
                groups.map(g => {
                  return (
                    <div className={style.groupCard}>
                      <div className={style.flexSpaceBetween}>
                        <h3>{g.name}</h3>
                        <span>{groupTotalAssignedSlots(g.id)} slots</span>
                      </div>
                      <div className={style.resourcesContainer}>
                        {
                          resources.dedicated.map((r, index) => {
                            return (
                              <AssignedResourceEditor
                                resourceName={r.name}
                                noSlots={assignedSlots.dedicated[index].find((a) => a.groupId === g.id).assignedSlots}
                                unassigned={unassignedSlots(index)}
                                onInputChange={(e) => handleInputChange(e, g.id, index)}
                                onSlotIncrease={() => handleIncrease(g.id, index)}
                                onSlotDecrease={() => handleDecrease(g.id, index)}
                              />
                            )
                          })
                        }
                      </div>
                      <div className={[style.resourcesContainer, style.burst].join(' ')}>
                        <div className={style.burstHeader}>Burst</div>
                        {
                          resources.burst.map((r, index) => {
                            return (
                              <AssignedResourceEditor
                                resourceName={r.name}
                                noSlots={assignedSlots.burst[index].find((a) => a.groupId === g.id).assignedSlots}
                                unassigned={unassignedSlots(index, true)}
                                onInputChange={(e) => handleInputChange(e, g.id, index, true)}
                                onSlotIncrease={() => handleIncrease(g.id, index, true)}
                                onSlotDecrease={() => handleDecrease(g.id, index, true)}
                              />
                            )
                          })
                        }
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className={style.column}>
            <h3>Changes</h3>
            <div className={style.scrollContainer}>
              <div className={style.changes}>
                {
                  groups.map((g, index) => {
                    if (changesForGroup(index).length > 0) {
                      return (
                        <>
                          <strong>{g.name}</strong>
                          {changesForGroup(index).map((change) => {
                            return (
                              <p>
                                {resources[assignmentType(change.isBurst)][change.resourceIndex].name} {change.isBurst ? 'burst' : ''}
                                <br />
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
            </div>
            <p>{requestResponse}</p>
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
