const Fallback = () => {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: '12rem' }}
    >
      <div>
        <h4>Something went wrong</h4>
        <p>
          Try clearing all data:{' '}
          <button
            onClick={() => {
              window.localStorage.clear();
              location.reload();
            }}
          >
            Clear Data
          </button>
        </p>
      </div>
    </div>
  );
};

export default Fallback;
