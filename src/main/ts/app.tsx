import * as React from 'react';

interface AppProps {}

export class App extends React.Component<AppProps, {}> {

  render () {
    return (
      <div>
        <nav className="nav has-shadow">
          <div className="nav-left">
            <a id="mop-logo" className="nav-item">MOP</a>
          </div>
        </nav>
        <div className="container is-fluid">
          <div className="notification">
            This is the main mop container created by react
          </div>
        </div>
      </div>
    );
  }

}
