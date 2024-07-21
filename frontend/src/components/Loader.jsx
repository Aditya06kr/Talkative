import React, { useEffect } from 'react';
import { newtonsCradle } from 'ldrs';

const Loader = () => {
  useEffect(() => {
    newtonsCradle.register();
  }, []);

  return (
    <div className="loader-container flex flex-col gap-10">
      <l-newtons-cradle size="78" speed="1.4" color="black"></l-newtons-cradle>
      <div>Setting up the Environment...</div>
    </div>
  );
};

export default Loader;
