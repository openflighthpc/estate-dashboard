import PropTypes from 'prop-types';
import React, { useState } from 'react';
import * as style from './ResourceAssignment.module.css';

function AssignedResource({ resourceName, noSlots, total, onInputChange, onSlotIncrease, onSlotDecrease }) {
  return (
    <p>
      <strong>{resourceName}</strong>
      No.slots:
      <input id="name" type="text" value={noSlots} onChange={onInputChange} />
      <button
        disabled = {noSlots >= total}
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
    { name: 'instance-type', assignedSlots: 4 },
    { name: 'on-prem model', assignedSlots: 2 },
    ];
  const resources2 = [
    { name: 'instance-type',
      assignments: [
        { groupId: 1, assignedSlots: 4},
        { groupId: 2, assignedSlots: 1},
      ],
      totalSlots: 10,
    },
    { name: 'on-prem model',
      assignments: [
        { groupId: 1, assignedSlots: 0},
        { groupId: 2, assignedSlots: 3},
      ],
      totalSlots: 5,
    },
  ];
  const groupResources = resources.map((g) => g.assignedSlots);
  const groupResources3 = resources2.map((res) => res.assignments);

  const [assignedSlots, setAssignedSlots] = useState(groupResources);
  const [assignedSlots3, setAssignedSlots3] = useState(groupResources3);
  const totalSlots = [10, 5];

  function ChangeAssignedSlots(e, i) {
    if (e.target.value >= 0 && e.target.value <= totalSlots[i]) {
      let newAssigned = assignedSlots.slice();
      newAssigned[i] = Number(e.target.value);
      setAssignedSlots(newAssigned);
    }
  }
  function handleIncrease(i) {
    let newAssigned = assignedSlots.slice();
    newAssigned[i] += 1;
    setAssignedSlots(newAssigned);
  }
  function handleDecrease(i) {
    let newAssigned = assignedSlots.slice();
    newAssigned[i] -= 1;
    setAssignedSlots(newAssigned);
  }

  function ChangeAssignedSlots3(e, groupId, resourceIndex) {
    if (e.target.value >= 0 && e.target.value <= resources2[resourceIndex].totalSlots) {
      let newAssigned = {...assignedSlots3};
      newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots = Number(e.target.value);
      setAssignedSlots3(newAssigned);
    }
  }
  function handleIncrease3(groupId, resourceIndex) {
    let newAssigned = {...assignedSlots3};
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots += 1;
    setAssignedSlots3(newAssigned);
  }
  function handleDecrease3(groupId, resourceIndex) {
    let newAssigned = {...assignedSlots3};
    newAssigned[resourceIndex].find((g) => g.groupId === groupId).assignedSlots -= 1;
    setAssignedSlots3(newAssigned);
  }

  return (
    <>
      <div className={style.pageGrid}>
        <div className={style.column}>
          <h1>Unassigned</h1>
          {totalSlots.map((total, index) => (
            <p><strong>{resources[index].name}</strong> No slots: {total - assignedSlots[index]}</p>
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
                      resources2.map((r, index) => {
                        return(
                          <>
                            <div>{r.name} {assignedSlots3[index].find((a) => a.groupId === g.id).assignedSlots}</div>
                            <AssignedResource
                              resourceName={r.name}
                              noSlots={assignedSlots3[index].find((a) => a.groupId === g.id).assignedSlots}
                              total={r.totalSlots}
                              onInputChange={(e) => ChangeAssignedSlots3(e, g.id, index)}
                              onSlotIncrease={() => handleIncrease3(g.id, index)}
                              onSlotDecrease={() => handleDecrease3(g.id, index)}
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
          {assignedSlots.map((res, index) => (
            <AssignedResource
              resourceName={resources[index].name}
              noSlots={assignedSlots[index]}
              total={totalSlots[index]}
              onInputChange={(e) => ChangeAssignedSlots(e, index)}
              onSlotIncrease={() => handleIncrease(index)}
              onSlotDecrease={() => handleDecrease(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

ResourceAssignment.propTypes = {
  name: PropTypes.string.isRequired, // this is passed from the Rails view
};

export default ResourceAssignment;
