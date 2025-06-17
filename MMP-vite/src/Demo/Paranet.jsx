import React, { useState } from 'react'
import Child from './Child';
import PropTypes from 'prop-types';
const Paranet = () => {
  const [prop,setProp]=useState({
    name:"dhanapal",
  })

const data = [
  { Name: "gweuygu", age: "98", gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" },
  { Name: "gweuygu", age: 98, gender: "male" }
];
  return (
    <div>
        <Child data={data} prop={{name:"giegduyv"}}/>

    </div>
  )
}

export default Paranet

Child.PropType={
  Name:PropTypes.string,
  age:PropTypes.integer,
  gender:PropTypes.string,
  data:PropTypes.array
}