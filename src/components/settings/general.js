import React, { Component } from 'react';
import {
  Button,
  Table,
  Alert,
} from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';
import app, { currentUser } from '../../app';
const userService = app.service('/users');
import ErrorAlert from '../error-alert';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class General extends Component {
  static get propTypes() {
    return {
      user: React.PropTypes.object,
      router: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {

    };
  }

  constructor(props) {
    super(props);
    const user = this.props.user || currentUser();
    this.state = {
      id: user.id,
      name: user.name,
      email: user.email,
      isNameLocked: false,
      isPasswordLocked: false,
      isDeleteClicked: false,
      newName: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.onDelete = this.onDelete.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
  }

  onChangeName(e) {
    this.setState({ isNameEditable: !this.state.isNameEditable });
    if (!this.state.isNameLocked && this.state.newName.length > 3) {
      e.preventDefault();
      this.setState({ newName: e.target.value });
      const patch = {
        name: this.state.newName,
      };
      return userService.patch(this.state.id, patch)
        .then(user => {
          this.setState({ name: user.name });
        })
        .catch(error => this.setState({ error }));
    }
    return true;
  }
  onChangePassword() {
    this.setState({ isPasswordLocked: !this.state.isPasswordLocked });
    const { isPasswordLocked, newPassword, confirmPassword } = this.state;
    if (isPasswordLocked && newPassword === confirmPassword && isPasswordLocked.length > 6) {
      const patch = {
        password: newPassword,
      };
      return userService.patch(this.state.id, patch)
        .catch(error => this.setState({ error }));
    }
    return true;
  }

  onDelete() {
    const query = {
      id: this.state.id,
    };
    return userService.remove(this.state.id, query)
    .then(() => {
      this.props.router.push('/login');
    })
    .catch(error => this.setState({ error }));
  }

  render() {
    return (
      <div style={styles.container}>
        <h1>General</h1>
        <br />
        <ErrorAlert
          error={this.state.error}
          onDismiss={() => this.setState({ error: null })}
        />
        <Table responsive hover>
          <tbody>
            <tr>
              <td>Email</td>
              <td>{this.state.email}</td>
              <td></td>
            </tr>
            <tr>
              <td>Name</td>
              <td>
                {this.state.isNameEditable ?
                  <input
                    placeholder={this.state.name}
                    type="text"
                    value={this.state.newName}
                    onChange={(e) => this.setState({ newName: e.target.value })}
                  />
                  :
                  this.state.name
                }
              </td>
              <td onClick={(e) => this.onChangeName(e)}>
                {this.state.isNameEditable ?
                  <a>Submit <Icon name="unlock" /></a>
                  :
                  <a>Edit <Icon name="lock" /></a>
                }
              </td>
            </tr>
            <tr>
              <td>Password</td>
              <td>
                {this.state.isPasswordLocked ?
                  <input
                    placeholder="New password"
                    type="password"
                    value={this.state.newPassword}
                    onChange={(e) => this.setState({ newPassword: e.target.value })}
                  />
                  :
                  'current password'
                }
              </td>
              <td onClick={(e) => this.onChangePassword(e)}>
                {this.state.isPasswordLocked ?
                  <a>Submit <Icon name="unlock" /></a>
                  :
                  <a>Edit <Icon name="lock" /></a>
                }
              </td>
            </tr>
            {renderIf(this.state.isPasswordLocked)(() =>
              <tr>
                <td>Confirm password</td>
                <td>
                  <input
                    placeholder="validate password"
                    type="password"
                    value={this.state.confirmPassword}
                    onChange={(e) => this.setState({ confirmPassword: e.target.value })}
                  />
                </td>
                <td>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {!this.state.isDeleteClicked ?
          <Button
            bsStyle="danger"
            type="submit"
            onClick={() => this.setState({ isDeleteClicked: !this.state.isDeleteClicked })}
          >
            Delete Account
          </Button>
          :
          <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
            <h4>This change is permanent</h4>
            <p></p>
            <p>
              <Button bsStyle="danger" onClick={this.onDelete}>Delete</Button>
              <span> or </span>
              <Button onClick={() => this.setState({ isDeleteClicked: !this.state.isDeleteClicked })}>
                Go back
              </Button>
            </p>
          </Alert>
        }
      </div>
    );
  }
}

const styles = {
  container: {

  },
  buttons: {
    justifyContent: 'space-between',
    padding: 100,
  },
};
