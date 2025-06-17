import "./Child.css"
const Child = ({data,prop}) => {
   // console.log("props received in Child:", props);

    //console.log("prop",props.Name);
  return (
    <div className='Child'>
        {/* <table>
            <tbody>
            <tr>
                <th>Name</th>
                <td>{props.Name}</td>
            </tr>
            <tr>
                <th>Age</th>
                <td>{props.age}</td>
            </tr>
            <tr>
                <th>Gender</th>
                <td>{props.gender}</td>
            </tr>
            </tbody>
        </table> */}

        <br></br>

        <table>
            <tbody>
                {data.map((item,index)=>(
                    <tr key={index}>
                        <td>{item.Name}</td>
                        <td>{item.age}</td>
                        <td>{item.gender}</td>

                    </tr>
                ))}
            </tbody>
        </table>

<h5>{prop.name}</h5>
    </div>
  )
}


export default Child