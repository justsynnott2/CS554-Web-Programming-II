import './App.css';

function TodoList(props){
    const uncompleted = props.todos.filter((todo) => todo.completed === false);

    const isPastDue = (date) => {
        let dateStr = date.split('/');
        dateStr = dateStr.map((s) => parseInt(s));
        const dueDate = new Date(dateStr[2], dateStr[0]-1, dateStr[1], 23, 59, 59);
        const today = new Date();
        return today > dueDate;
    }

    return(
        <div>
            <h1>TODO:</h1>
            {uncompleted.map((todo) => 
            <div>
                <h1 className={isPastDue(todo.due) ? "pastDue" : ""}>{todo.title}</h1>
                <p>{todo.description}</p>
                <p className={isPastDue(todo.due) ? "pastDue" : ""}>Due date: {todo.due}</p>
                <p>Completed: No</p>
                <button onClick={() => props.deleteTodo(todo.id)}>Delete</button>
                <button onClick={() => props.toggleCompleted(todo)}>Complete</button>
            </div>
            )}
        </div>
    );
}

export default TodoList;