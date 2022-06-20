window.electronAPI.subscribeCTCMessage( (_event, payload) => {
  console.log('IPC:CTCOffice: ', payload);
});

const CTCOffice = () => {
  return <p>CTC Office!!</p>;
};

export default CTCOffice;
