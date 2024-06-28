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
      <h3>Hello, {name}!</h3>
      <hr />
      <form>
        <label className={style.bright} htmlFor="name">
          Say hello to:
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      </form>

      <div className={style.pageGrid}>
        <div className={style.column}>
          <h1>Unassigned</h1>
          <p>No slots: {totalSlots[0] - assignedSlots[0]}</p>
          <p>No slots: {totalSlots[1] - assignedSlots[1]}</p>

        </div>
        <div className={style.column}>
          <h1>Assigned</h1>
          <AssignedResource
            noSlots={assignedSlots[0]}
            total={totalSlots[0]}
            onInputChange={(e) => ChangeAssignedSlots(e, 0)}
            onSlotIncrease={() => handleIncrease(0)}
            onSlotDecrease={() => handleDecrease(0)}
          />
          <AssignedResource
            noSlots={assignedSlots[1]}
            total={totalSlots[1]}
            onInputChange={(e) => ChangeAssignedSlots(e, 1)}
            onSlotIncrease={() => handleIncrease(1)}
            onSlotDecrease={() => handleDecrease(1)}
          />
        </div>
      </div>
    </>
  );
};

ResourceAssignment.propTypes = {
  name: PropTypes.string.isRequired, // this is passed from the Rails view
};

export default ResourceAssignment;
