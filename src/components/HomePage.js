import React, { useState, useEffect } from 'react';
import { auth, database } from './firebase-config';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, remove } from 'firebase/database';
import Timetable from './Timetable';
import AdminPanel from './AdminPanel';
import './HomePage.css';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(<option key={time} value={time}>{time}</option>);
    }
  }
  return options;
};

const HomePage = () => {
  const [showTimetable, setShowTimetable] = useState(false);
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const navigate = useNavigate();
  const [isAdmin , setIsAdmin] = useState(false);
   const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserName(user.displayName);
        setIsAdmin(!!user.isAdmin);
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          setIsAdmin(!!userData.isAdmin);
        });
        setIsAdmin(!!user.isAdmin);
        const boardsRef = ref(database, 'boards/');
        onValue(boardsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const loadedBoards = Object.keys(data).map(key => ({
              id: key,
              name: data[key].name,
              tempData: data[key].tempData || '',
              displayDate: data[key].displayDate || '',
              timeRange: data[key].timeRange || '00:00 to 00:00',
            }));
            setBoards(loadedBoards);
          } else {
            setBoards([]);
          }
          setIsLoading(false);
        }, error => {
          console.error("Failed to read data:", error);
          setIsLoading(false);
        });
      } else {
        navigate('/login');
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  

  const makeUserAdmin = (email) => {
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        const userId = Object.keys(userData).find(key => userData[key].email === email);
        if (userId) {
          const userRef = ref(database, `users/${userId}`);
          set(userRef, { ...userData[userId], isAdmin: true })
            .then(() => console.log(`${email} promoted to admin successfully!`))
            .catch(error => console.error("Error promoting user to admin:", error));
        } else {
          console.error(`User with email ${email} not found.`);
        }
      } else {
        console.error("No user data found.");
      }
    });
  };
  
  // Call this function with the email of the user you want to make admin
  makeUserAdmin('rithikverma877@gmail.com');
  

  const handleSaveBoard = (board) => {
    if (!isAdmin) {
      // Display an error message or prevent saving if the user is not an admin
      setNotificationMessage('You Are Not Authorized');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
  
    const boardRef = ref(database, `boards/${board.id}`);
    set(boardRef, {
      name: board.name,
      tempData: board.tempData,
      displayDate: board.displayDate,
      timeRange: board.timeRange,
    })
    .then(() => {
      setNotificationMessage('Board data saved successfully!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    })
    .catch(error => {
      setNotificationMessage(`Error: ${error.message}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    });
  };
  
  const handleKeyPress = (event, board) => {
    if (!isAdmin) {
      // Prevent saving if the user is not an admin
      return;
    }
  
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveBoard(board);
    }
  };
  const handleAddBoard = () => {
    if (!newBoardName.trim()) {
      alert('Please enter a valid board name.');
      return;
    }
    if (!isAdmin) {
      setNotificationMessage('Only administrators can add new boards.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
    const newBoardRef = push(ref(database, 'boards'));
    set(newBoardRef, {
      name: newBoardName,
      displayDate: new Date().toISOString().substring(0, 10),
      timeRange: '00:00 to 00:00'
    });
    setNewBoardName('');
  };
  

  const timeOptions = generateTimeOptions();

  const handleDeleteBoard = (board) => {
    if (!isAdmin) {
      // Display an error message or prevent deleting if the user is not an admin
      setNotificationMessage('Only admins can delete boards.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
  
    const confirmDelete = window.confirm(`Are you sure you want to delete "${board.name}"?`);
    if (confirmDelete) {
      const boardRef = ref(database, `boards/${board.id}`);
      remove(boardRef)
        .then(() => {
          setNotificationMessage(`Board "${board.name}" deleted successfully!`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        })
        .catch(error => {
          setNotificationMessage(`Error deleting board "${board.name}": ${error.message}`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        });
    }
  };
  

  return (
    <div>
     <nav className="navbar">
  <div>
    <span>Hello {userName}</span>
  </div>
  <div className="navbar-actions">
    <Button
      variant="contained"
      color="primary"
      onClick={() => setShowTimetable(true)}
      className="show-timetable-button"
    >
      Show Timetable
    </Button>
    <Button
      variant="contained"
      color="primary"
      onClick={() => setShowTimetable(false)}
      className="show-boards-button"
    >
      Show Boards
    </Button>
    <Button
      variant="contained"
      color="secondary"
      startIcon={<LogoutIcon />}
      onClick={() => auth.signOut().then(() => navigate('/login'))}
      className="logout-button"
    >
      Logout
    </Button>
    {isAdmin && (
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className="admin-panel-toggle-button"
      >
        {showAdminPanel ? 'Hide Admin Panel' : 'Show Admin Panel'}
      </Button>
    )}
  </div>
</nav>

      <div className="home-container">
        {showAdminPanel ? (
          <AdminPanel />
        ) : showTimetable ? (
          <Timetable />
        ) : (
          <>
            <h1>Smart Board Dashboard</h1>
            <div className="add-board-container">
              <h2>Add New Board</h2>
              <input
                type="text"
                placeholder="New Board Name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="add-board-input"
              />
             <Button
  variant="outlined"
  color="primary"
  startIcon={<AddIcon />}
  onClick={handleAddBoard}  // Use the function here
  className="add-board-button"
>
  Add Board
</Button>

            </div>
            <div className="my-boards-container">
              <h2>My Boards</h2>
              {isLoading ? <p>Loading boards...</p> : (
                <ul className="board-list">
                  {boards.map((board) => (
                    <li key={board.id} className="board-item">
                      <div className="board-details">
                        <div className="board-name">{board.name}</div>
                        <textarea
                          value={board.tempData}
                          onChange={(e) => {
                            const value = e.target.value;
                            setBoards(boards.map(b => b.id === board.id ? { ...b, tempData: value } : b));
                          }}
                          onKeyDown={(e) => handleKeyPress(e, board)}
                          placeholder="Enter data here"
                        />
                         <label>Datec
                          :</label>
                        <input
                          type="date"
                          value={board.displayDate}
                          onChange={(e) => setBoards(boards.map(b => b.id === board.id ? { ...b, displayDate: e.target.value } : b))}
                        />
                        <label>Start Time:</label>
                        <select
                          value={board.timeRange.split(' to ')[0]}
                          onChange={(e) => {
                            const newTimeRange = `${e.target.value} to ${board.timeRange.split(' to ')[1]}`;
                            setBoards(boards.map(b => b.id === board.id ? { ...b, timeRange: newTimeRange } : b));
                          }}
                        >
                          {timeOptions}
                        </select>
                        <label>End Time:</label>
                        <select
                          value={board.timeRange.split(' to ')[1]}
                          onChange={(e) => {
                            const newTimeRange = `${board.timeRange.split(' to ')[0]} to ${e.target.value}`;
                            setBoards(boards.map(b => b.id === board.id ? { ...b, timeRange: newTimeRange } : b));
                          }}
                        >
                          {timeOptions}
                        </select>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={() => handleSaveBoard(board)}
                        >
                          Save
                        </Button>
                        <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteBoard(board)}
                        >
                       Delete
                    </Button>
                    </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
      {showNotification && (
         <Snackbar open={showNotification} autoHideDuration={6000} onClose={() => setShowNotification(false)}>
         <Alert onClose={() => setShowNotification(false)} severity="info" sx={{ width: '100%', }}>
           {notificationMessage}
         </Alert>
       </Snackbar>
      )}
    </div>
  );
};

export default HomePage;
