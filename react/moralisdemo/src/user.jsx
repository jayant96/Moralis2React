import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

export default function User() {
  const navigate = useNavigate();

  const [session, setSession] = useState({});

  useEffect(() => {
    axios(`http://localhost:4000/authenticate`, {
      withCredentials: true,
    })
      .then(({ data }) => {
        const { iat, ...authData } = data; // remove unimportant iat value

        setSession(authData);
      })
      .catch((err) => {
        navigate('/signin');
      });
  }, []);

  async function signOut() {
    await axios(`http://localhost:4000/logout`, {
      withCredentials: true,
    });

    navigate('/signin');
  }

  return (
    <div>
      <h3>User session:</h3>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}