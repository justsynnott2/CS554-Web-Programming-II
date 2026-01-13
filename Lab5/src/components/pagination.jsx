import React, {useState, useEffect} from 'react';

function pagination(props) {
    
    const remainingCount = props.count - (props.pageNumber * props.perPage)

    return (
        <div>
            {props.pageNumber > 1 && <button onClick={props.previous}>PREVIOUS</button>}
            {remainingCount > 0 && <button onClick={props.next}>NEXT</button>}
        </div>
    )

};

export default pagination;