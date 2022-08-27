import axios from "axios";
import React, { useState } from "react";

const Count = () => {
  const [count, setCount] = useState();
  axios.get("http://localhost:4000/get_total_search_count").then((res) => {
    setCount(res.data.totalSearch);
  });
  return (
    <div className="mb-5 text-center">
      {count && <h4>Total search {count} times</h4>}
    </div>
  );
};

export default Count;
