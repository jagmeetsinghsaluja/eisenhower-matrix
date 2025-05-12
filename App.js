
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const categories = [
  { title: "Important & Urgent", key: "q1", color: "bg-red-100" },
  { title: "Important & Not Urgent", key: "q2", color: "bg-green-100" },
  { title: "Not Important & Urgent", key: "q3", color: "bg-yellow-100" },
  { title: "Not Important & Not Urgent", key: "q4", color: "bg-gray-100" },
];

export default function EisenhowerMatrix() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("eisenhowerTasks");
    return stored ? JSON.parse(stored) : { q1: [], q2: [], q3: [], q4: [] };
  });

  const [inputs, setInputs] = useState({ q1: "", q2: "", q3: "", q4: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    localStorage.setItem("eisenhowerTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (key) => {
    if (!inputs[key].trim()) return;
    const newTask = { id: Date.now(), text: inputs[key] };
    setTasks((prev) => ({ ...prev, [key]: [...prev[key], newTask] }));
    setInputs((prev) => ({ ...prev, [key]: "" }));
  };

  const deleteTask = (key, id) => {
    setTasks((prev) => ({
      ...prev,
      [key]: prev[key].filter((task) => task.id !== id),
    }));
  };

  const editTask = (key, task) => {
    setEditing({ key, ...task });
  };

  const updateTask = () => {
    const { key, id, text } = editing;
    setTasks((prev) => ({
      ...prev,
      [key]: prev[key].map((task) =>
        task.id === id ? { ...task, text } : task
      ),
    }));
    setEditing(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = Array.from(tasks[source.droppableId]);
    const [movedTask] = sourceList.splice(source.index, 1);

    const destList = Array.from(tasks[destination.droppableId]);
    destList.splice(destination.index, 0, movedTask);

    setTasks((prev) => ({
      ...prev,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Eisenhower Matrix (Offline)</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(({ title, key, color }) => (
            <div key={key} className={`${color} p-4 rounded-2xl shadow`}>
              <h2 className="font-bold text-lg mb-2">{title}</h2>
              <div className="flex gap-2 mb-2">
                <input
                  value={inputs[key]}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder="Add a task"
                  className="border p-2 flex-1 rounded"
                />
                <button onClick={() => addTask(key)} className="bg-blue-500 text-white px-4 rounded">
                  Add
                </button>
              </div>
              <Droppable droppableId={key}>
                {(provided) => (
                  <ul
                    className="list-disc pl-5 space-y-1 min-h-[40px]"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {tasks[key].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex justify-between items-center"
                          >
                            <span>{task.text}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => editTask(key, task)}
                                className="text-sm text-blue-600"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deleteTask(key, task.id)}
                                className="text-sm text-red-600"
                              >
                                ❌
                              </button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-xl space-y-2 w-80">
            <h2 className="font-bold text-lg">Edit Task</h2>
            <input
              value={editing.text}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              className="border p-2 w-full rounded"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="text-gray-700">Cancel</button>
              <button onClick={updateTask} className="bg-green-500 text-white px-4 py-1 rounded">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
