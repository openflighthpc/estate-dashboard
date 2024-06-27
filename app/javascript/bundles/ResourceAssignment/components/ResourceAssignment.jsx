import PropTypes from 'prop-types';
import React, { useState } from 'react';
import * as style from './ResourceAssignment.module.css';

const ResourceAssignment = (props) => {
  const [name, setName] = useState(props.name);

  const groups = [
    { name: 'Traditional HPC', assignedSlots: 4 },
    { name: 'R&D', assignedSlots: 2 },
    ];
  const [assignedSlots, setAssignedSlots] = useState(6);
  const totalSlots = 10;

  function ChangeAssignedSlots(e) {
    if (e.target.value >= 0 && e.target.value <= totalSlots) {
      setAssignedSlots(Number(e.target.value));
    }
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
          <p>
            No. slots: {totalSlots - assignedSlots}
          </p>
        </div>
        <div className={style.column}>
          <h1>Assigned</h1>
          <div className='d-flex'>
            No.slots:
            <input id="name" type="text" value={assignedSlots} onChange={ChangeAssignedSlots} />
            <button
              disabled = {assignedSlots >= totalSlots}
              onClick={() => setAssignedSlots(assignedSlots + 1)}
            >+</button>
            <button
              disabled = {assignedSlots <= 0}
              onClick={() => setAssignedSlots(assignedSlots - 1)}
            >-</button>
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
