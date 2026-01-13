import { useState } from 'react'
import './App.css'
import TodoList from './TodoList.jsx';
import CompletedTodos from './CompletedTodos.jsx';

function App() {
  const [todos, setTodos] = useState([
    {id: 1, title: 'Pay cable bill', description: 'Pay the cable bill by the 15th of the month', due: '3/15/2023', completed: false},
    {id: 2, title: 'Do the laundry', description: 'Put your dirty clothes into the washer', due: '10/24/2025', completed: false},
    {id: 3, title: 'Finish CS554 Lab', description: 'Complete and submit lab 4', due: '10/20/2025', completed: false},
    {id: 4, title: 'Walk the dog', description: 'Take the dog out on a walk', due: '10/19/2025', completed: false},
    {id: 5, title: 'Return halloween costume', description: 'Bring the package to the UPS store to be returned', due: '11/7/2025', completed: false},
    {id: 6, title: 'Buy new halloween costume', description: 'Buy a new costume for halloween', due: '10/31/2025', completed: false},
    {id: 7, title: 'Wash the dishes', description: 'Put the dishes in dish washer and run', due: '10/22/2025', completed: false},
    {id: 8, title: 'Get birthday present for friend', description: 'Buy a present for your friends birthday', due: '11/2/2025', completed: false},
    {id: 9, title: 'Take the trash out', description: 'Take the trash to the curb by 7pm', due: '10/20/2025', completed: false},
    {id: 10, title: 'Buy groceries', description: 'Restock your fridge', due: '10/22/2025', completed: false},
  ]);

  const deleteTodo = (id) => {
    const postRemoveTodos = todos.filter((todo) => todo.id !== id);
    setTodos(postRemoveTodos);
  }

  const toggleCompleted = (todo) => {
    const postToggleTodos = todos.map((t) => t === todo ? {id: t.id, title: t.title, description: t.description, due: t.due, completed: !t.completed} : t);
    setTodos(postToggleTodos);
  }

  return (
    <>
      <TodoList
        todos = {todos}
        deleteTodo = {deleteTodo}
        toggleCompleted = {toggleCompleted}
      />
      <CompletedTodos
        todos = {todos}
        toggleCompleted = {toggleCompleted}
      />
    </>
  )
}

export default App