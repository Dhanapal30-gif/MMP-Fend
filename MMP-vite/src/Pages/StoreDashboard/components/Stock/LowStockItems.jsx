import React from "react";

const LowStockItems = ({
  items = [],
}) => {

  const defaultItems = [
    {
      partCode: "PART-10023",
      description: "Bearing 6205",
      availableQty: 8,
      minimumLevel: 20,
      uom: "NOS",
    },
    {
      partCode: "PART-10045",
      description: "Filter Element",
      availableQty: 5,
      minimumLevel: 15,
      uom: "NOS",
    },
    {
      partCode: "PART-10067",
      description: "O-Ring 10mm",
      availableQty: 12,
      minimumLevel: 25,
      uom: "NOS",
    },
  ];

  const data =
    items.length > 0
      ? items
      : defaultItems;


  /*
   * LOW STOCK:
   *
   * availableQty > 0
   * AND
   * availableQty < minimumLevel
   */

  const lowStockItems =
    data.filter(
      (item) =>
        Number(item.availableQty) > 0 &&
        Number(item.availableQty) <
          Number(item.minimumLevel)
    );

  return (


      <div className="stock-table-card">

  <h3 className="section-title">
    Low Stock Items
  </h3>

  <table className="stock-table">

          <thead>

            <tr>

              <th>
                Part Code
              </th>

              <th>
                Description
              </th>

              <th>
                Available Qty
              </th>

              <th>
                Min. Level
              </th>

              <th>
                UOM
              </th>

            </tr>

          </thead>


          <tbody>

            {lowStockItems.map(
              (item) => (

                <tr
                  key={
                    item.partCode
                  }
                >

                  <td>
                    {item.partCode}
                  </td>

                  <td>
                    {item.description}
                  </td>

                  <td>
                    {item.availableQty}
                  </td>

                  <td>
                    {item.minimumLevel}
                  </td>

                  <td>
                    {item.uom}
                  </td>

                </tr>

              )
            )}


            {lowStockItems.length === 0 && (
              <tr>

                <td
                  colSpan="5"
                  className="empty-table"
                >
                  No low stock items
                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

 
  );
};

export default LowStockItems;