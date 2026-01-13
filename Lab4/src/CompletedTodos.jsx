function CompletedTodos(props){
    const completed = props.todos.filter((todo) => todo.completed === true);

    return(
        <div>
            <h1>COMPLETED:</h1>
            {completed.map((todo) => 
            <div>
                <h1>{todo.title}</h1>
                <p>{todo.description}</p>
                <p>Due date: {todo.due}</p>
                <p>Completed: Yes</p>
                <button onClick={() => props.toggleCompleted(todo)}>Mark Incomplete</button>
            </div>
            )}
        </div>
    );
}

export default CompletedTodos;