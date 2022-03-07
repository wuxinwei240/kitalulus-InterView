import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';

import Interview  from './page/interview/interview'

const store ={

}


class App extends Component {
  render(){
    return(
      <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/interview" element={<Interview />} >
            </Route>
          </Routes>
        </Router>
      </Provider>
    )
  }
}


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
