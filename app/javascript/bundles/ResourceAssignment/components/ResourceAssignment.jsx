import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import * as style from './ResourceAssignment.module.css';

function AssignedResource({ resourceName, noSlots, unassigned, onInputChange, onSlotIncrease, onSlotDecrease }) {
  return (
    <p>
      <strong>{resourceName}</strong>
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/assignment/raw-data'); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setData(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  console.log(data);


  const groups = [
    { id: 1, name: 'Traditional HPC'},
    { id: 2, name: 'R&D'},
  ];
  const resources = [
    { id: 1,
      name: 'instance-type',
      assignments: [
        { groupId: 1, assignedSlots: 4},
        { groupId: 2, assignedSlots: 1},
      ],
      totalSlots: 15,
    },
    { id: 2,
      name: 'on-prem model',
      assignments: [
        { groupId: 1, assignedSlots: 0},
        { groupId: 2, assignedSlots: 3},
      ],
      totalSlots: 5,
    },
  ];
  const initialAssignments = resources.map((res) => res.assignments);
  const [assignedSlots, setAssignedSlots] = useState(initialAssignments);

  function unassignedSlots(index) {
    let assigned = [...assignedSlots][index];
    const totalSlots = resources[index].totalSlots;
    return totalSlots - assigned.map((a) => a.assignedSlots).reduce((partialSum, a) => partialSum + a, 0);
  }

  function handleInputChange(e, groupId, resourceIndex) {
    if (e.target.value >= 0) {
      const maxSlots = unassignedSlots(resourceIndex) + assignedSlots[resourceIndex].find((g) => g.groupId === groupId).assignedSlots;
      if ( e.target.value <= maxSlots) {
        let newAssigned = [...assignedSlots];
        newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots = Number(e.target.value);
        setAssignedSlots(newAssigned);
      }
    }
  }
  function handleIncrease(groupId, resourceIndex) {
    let newAssigned = [...assignedSlots];
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots += 1;
    setAssignedSlots(newAssigned);
  }
  function handleDecrease(groupId, resourceIndex) {
    let newAssigned = [...assignedSlots];
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots -= 1;
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
        changedAssignments.push(
          {
            resourceIndex: i,
            resourceId: resources[i].id,
            initiallyAssigned: initiallyAssigned,
            nowAssigned: nowAssigned,
          }
        )
      }
    }
    return changedAssignments;
  }

  async function sendChanges() {
    try {
      let data = [];
      for (let i = 0; i < groups.length; i++) {
        const changes = changesForGroup(i);
        if (changes.length > 0) {
          data.push({ groupId: groups[i].id, changes: changes });
        }
      }
      const response = await fetch("http://127.0.0.1:3000/assignment/send-message", {
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
                        return(
                          <>
                            <AssignedResource
                              resourceName={r.name}
                              noSlots={assignedSlots[index].find((a) => a.groupId === g.id).assignedSlots}
                              unassigned={unassignedSlots(index)}
                              onInputChange={(e) => handleInputChange(e, g.id, index)}
                              onSlotIncrease={() => handleIncrease(g.id, index)}
                              onSlotDecrease={() => handleDecrease(g.id, index)}
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
                return(
                  <>
                    <h3>{g.name}</h3>
                    {changesForGroup(index).map((change) => {
                      return(
                        <p>
                          {resources[change.resourceIndex].name}
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
    </>
  );
};

ResourceAssignment.propTypes = {
  name: PropTypes.string.isRequired, // this is passed from the Rails view
};

export default ResourceAssignment;
