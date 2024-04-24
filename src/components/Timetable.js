import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from './firebase-config';
import Button from '@mui/material/Button';
import { getAuth } from 'firebase/auth';


const Timetable = React.memo(() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = ['10:00', '11:00', '12:00' ,'13:00', '13:30', '15:30','16:30'];
  const [schedule, setSchedule] = useState(days.reduce((acc, day) => {
    acc[day] = hours.reduce((innerAcc, hour) => {
      innerAcc[hour] = "";
      return innerAcc;
    }, {});
    return acc;
  }, {}));
  const [tempSchedule, setTempSchedule] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State to track if the user is admin

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        setIsAdmin(userData?.isAdmin || false);
      });
    }
  
    const timetableRef = ref(database, 'timetable');
    onValue(timetableRef, (snapshot) => {
      const data = snapshot.val();
      setSchedule(data);
      setTempSchedule(data); // Set tempSchedule when data is fetched
    });
  }, []);
  

  // const makeUserAdmin = (email) => {
  //   const usersRef = ref(database, 'users');
  //   onValue(usersRef, (snapshot) => {
  //     const userData = snapshot.val();
  //     if (userData) {
  //       const userId = Object.keys(userData).find(key => userData[key].email === email);
  //       if (userId) {
  //         const userRef = ref(database, `users/${userId}`);
  //         set(userRef, { ...userData[userId], isAdmin: true })
  //           .then(() => console.log(`${email} promoted to admin successfully!`))
  //           .catch(error => console.error("Error promoting user to admin:", error));
  //       } else {
  //         console.error(`User with email ${email} not found.`);
  //       }
  //     } else {
  //       console.error("No user data found.");
  //     }
  //   });
  // };
  
  // // Call this function with the email of the user you want to make admin
  // makeUserAdmin('rithikverma877@gmail.com');

  const handleChange = (day, time, value) => {
    setTempSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: value
      }
    }));
  };

  const handleSave = () => {
    const timetableRef = ref(database, 'timetable');
    set(timetableRef, tempSchedule).then(() => {
      setSchedule(tempSchedule); // Confirm the changes
      alert('Schedule saved successfully!');
    }).catch(error => {
      alert(`Failed to save schedule: ${error.message}`);
    });
    setEditMode(false);
  };

  const toggleEdit = () => {
    if (!isAdmin) {
      alert('Only admins can edit the schedule.');
      return;
    }
    setTempSchedule(schedule); // Store current state to tempSchedule when starting to edit
    setEditMode(!editMode);
  };
  

  return (
    <div>
      <header className='ClassName'>Schedule Time-Table</header>
      <table>
        <thead>
          <tr>
            <th>Time / Day</th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td>{hour}</td>
              {days.map(day => (
                <td key={`${day}-${hour}`}>
                 <input
                 type="text"
                 value={editMode? (tempSchedule[day] && tempSchedule[day][hour]) || '' : (schedule[day] && schedule[day][hour]) || ''}
                 onChange={(e) => handleChange(day, hour, e.target.value)}
                  placeholder="Add activity"
                  readOnly={!editMode}
                 />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {isAdmin && (
  <div>
    <Button variant="outlined" onClick={toggleEdit} color="primary">
      {editMode ? "Cancel Edit" : "Edit Schedule"}
    </Button>
    {editMode && (
      <Button variant="outlined" onClick={handleSave} color="primary">
        Save Changes
      </Button>
    )}
  </div>
)}

    </div>
  );
});

export default Timetable;


