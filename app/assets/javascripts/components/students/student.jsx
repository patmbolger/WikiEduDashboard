import React from 'react';
import ServerActions from '../../actions/server_actions.js';

import AssignCell from './assign_cell.jsx';

import RevisionStore from '../../stores/revision_store.js';
import TrainingStatusStore from '../../stores/training_status_store.js';
import UIStore from '../../stores/ui_store.js';
import UIActions from '../../actions/ui_actions.js';
import { trunc } from '../../utils/strings';

const Student = React.createClass({
  displayName: 'Student',

  propTypes: {
    student: React.PropTypes.object.isRequired,
    course: React.PropTypes.object.isRequired,
    current_user: React.PropTypes.object,
    editable: React.PropTypes.bool,
    assigned: React.PropTypes.array,
    reviewing: React.PropTypes.array
  },

  mixins: [UIStore.mixin],

  getInitialState() {
    return { is_open: false };
  },

  storeDidChange() {
    return this.setState({ is_open: UIStore.getOpenKey() === (`drawer_${this.props.student.id}`) });
  },

  stop(e) {
    return e.stopPropagation();
  },
  openDrawer() {
    RevisionStore.clear();
    TrainingStatusStore.clear();
    ServerActions.fetchRevisions(this.props.student.id, this.props.course.id);
    ServerActions.fetchTrainingStatus(this.props.student.id, this.props.course.id);
    return UIActions.open(`drawer_${this.props.student.id}`);
  },
  buttonClick(e) {
    e.stopPropagation();
    return this.openDrawer();
  },

  _shouldShowRealName() {
    const studentRole = 0;
    if (!this.props.student.real_name) { return false; }
    return this.props.current_user && (this.props.current_user.admin || this.props.current_user.role > studentRole);
  },


  render() {
    let className = 'students';
    className += this.state.is_open ? ' open' : '';

    let userName = this._shouldShowRealName() ? (
      <span>
        <strong>{trunc(this.props.student.real_name)}</strong>
        &nbsp;
        (<a onClick={this.stop} href={this.props.student.contribution_url} target="_blank">
          {trunc(this.props.student.username)}
        </a>)
      </span>
    ) : (
      <span><a onClick={this.stop} href={this.props.student.contribution_url} target="_blank">
        {trunc(this.props.student.username)}
      </a></span>
    );

    const trainingProgress = this.props.student.course_training_progress ? (
      <small className="red">{this.props.student.course_training_progress}</small>
    ) : undefined;

    let assignButton;
    let reviewButton;
    if (this.props.course.published) {
      assignButton = (
        <AssignCell {...this.props}
          role={0}
          editable={this.props.editable}
          assignments={this.props.assigned}
        />
      );

      reviewButton = (
        <AssignCell {...this.props}
          role={1}
          editable={this.props.editable}
          assignments={this.props.reviewing}
        />
      );
    }

    return (
      <tr onClick={this.openDrawer} className={className}>
        <td>
          <div className="name">
            {userName}
          </div>
          {trainingProgress}
          <div className="sandbox-link"><a onClick={this.stop} href={this.props.student.sandbox_url} target="_blank">(sandboxes)</a></div>
        </td>
        <td className="desktop-only-tc">
          {assignButton}
        </td>
        <td className="desktop-only-tc">
          {reviewButton}
        </td>
        <td className="desktop-only-tc">{this.props.student.recent_revisions}</td>
        <td className="desktop-only-tc">{this.props.student.character_sum_ms} | {this.props.student.character_sum_us}</td>
        <td><button className="icon icon-arrow table-expandable-indicator" ></button></td>
      </tr>
    );
  }
}
);

export default Student;
