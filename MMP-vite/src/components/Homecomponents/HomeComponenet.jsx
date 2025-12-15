import React from 'react';
import './HomeComponent.css';

const HomeComponent = () => {
  const stats = [
    { title: 'Total Stock', value: 1200 },
    { title: 'Total Products', value: 350 },
    { title: 'Total Orders', value: 87 },
    { title: 'Pending Shipments', value: 14 },
    { title: 'Suppliers', value: 25 },
  ];

  return (
    <div className="home-container">
      {stats.map((stat, index) => (
        <div key={index} className="stat-box">
          <h6>{stat.title}</h6>
          <p>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default HomeComponent;
