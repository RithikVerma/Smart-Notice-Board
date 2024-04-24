import React, { useState, useEffect } from 'react';
import { database } from './firebase-config';
import { ref, onValue, set } from 'firebase/database';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map(key => ({
          id: key,
          email: data[key].email,
          displayName: data[key].fullName,
          phoneNumber: data[key].phoneNumber,
          isAdmin: data[key].isAdmin || false,
        }));
        setUsers(userList);
      }
    });
  }, []);

  const makeAdmin = (userId) => {
    const userRef = ref(database, `users/${userId}`);
    set(userRef, { ...users.find(user => user.id === userId), isAdmin: true })
      .then(() => console.log(`User ${userId} promoted to admin successfully!`))
      .catch(error => console.error("Error promoting user to admin:", error));
  };

  return (
    <div className="admin-panel">
      <h1>User Management</h1>
      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-detail"><strong>Email:</strong> {user.email}</div>
            <div className="user-detail"><strong>Name:</strong> {user.displayName}</div>
            <div className="user-detail"><strong>Phone:</strong> {user.phoneNumber}</div>
            <div className="user-detail"><strong>Admin Status:</strong> {user.isAdmin ? 'Yes' : 'No'}</div>
            <div className="user-actions">
              {!user.isAdmin && (
                <button onClick={() => makeAdmin(user.id)}>Make Admin</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
