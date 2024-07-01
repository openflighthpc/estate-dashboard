import PropTypes from 'prop-types';
import React, { useState } from 'react';
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
  const [name, setName] = useState(props.name);

  const groups = [
    { id: 1, name: 'Traditional HPC'},
    { id: 2, name: 'R&D'},
  ];
  const resources = [
    { name: 'instance-type',
      assignments: [
        { groupId: 1, assignedSlots: 4},
        { groupId: 2, assignedSlots: 1},
      ],
      totalSlots: 15,
    },
    { name: 'on-prem model',
      assignments: [
        { groupId: 1, assignedSlots: 0},
        { groupId: 2, assignedSlots: 3},
      ],
      totalSlots: 5,
    },
  ];
  const groupResources = resources.map((res) => res.assignments);
  const [assignedSlots, setAssignedSlots] = useState(groupResources);

  function unassignedSlots(index) {
    let assigned = {...assignedSlots}[index];
    const totalSlots = resources[index].totalSlots;
    return totalSlots - assigned.map((a) => a.assignedSlots).reduce((partialSum, a) => partialSum + a, 0);
  }

  function handleInputChange(e, groupId, resourceIndex) {
    if (e.target.value >= 0) {
      const maxSlots = unassignedSlots(resourceIndex) + assignedSlots[resourceIndex].find((g) => g.groupId === groupId).assignedSlots;
      if ( e.target.value <= maxSlots) {
        let newAssigned = {...assignedSlots};
        newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots = Number(e.target.value);
        setAssignedSlots(newAssigned);
      }
    }
  }
  function handleIncrease(groupId, resourceIndex) {
    let newAssigned = {...assignedSlots};
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots += 1;
    setAssignedSlots(newAssigned);
  }
  function handleDecrease(groupId, resourceIndex) {
    let newAssigned = {...assignedSlots};
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots -= 1;
    setAssignedSlots(newAssigned);
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
      </div>
    </>
  );
};

ResourceAssignment.propTypes = {
  name: PropTypes.string.isRequired, // this is passed from the Rails view
};

export default ResourceAssignment;
