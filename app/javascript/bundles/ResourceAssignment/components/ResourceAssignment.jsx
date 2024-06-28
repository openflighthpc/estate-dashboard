import PropTypes from 'prop-types';
import React, { useState } from 'react';
import * as style from './ResourceAssignment.module.css';

function AssignedResource({ noSlots, total, onInputChange, onSlotIncrease, onSlotDecrease }) {
  return (
    <p>
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
    { name: 'Traditional HPC', assignedSlots: 4 },
    { name: 'R&D', assignedSlots: 2 },
    ];
  const groupResources = groups.map((g) => g.assignedSlots);
  const [assignedSlots, setAssignedSlots] = useState(groupResources);
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

  return (
    <>
      <div className={style.pageGrid}>
        <div className={style.column}>
          <h1>Unassigned</h1>
          {totalSlots.map((total, index) => (
            <p>No slots: {total - assignedSlots[index]}</p>
          ))}
        </div>
        <div className={style.column}>
          <h1>Assigned</h1>
          {assignedSlots.map((res, index) => (
            <AssignedResource
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
