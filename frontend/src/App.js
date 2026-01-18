
import './App.css';
import { Route } from 'react-router-dom';
import HomePages from "./Pages/HomePages";
import ChatPage from "./Pages/ChatPage";

function App() {
  return (
    <div className="App">
      <Route path="/" component={HomePages} exact />    
      <Route path="/chats" component={ChatPage} />    

    </div>
  );
}

export default App;
