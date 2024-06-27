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

  return (
    <>
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
            <p>
              No.slots: {assignedSlots}
            </p>
            <button onClick={() => setAssignedSlots(assignedSlots + 1)}>+</button>
            <button onClick={() => setAssignedSlots(assignedSlots - 1)}>-</button>
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
