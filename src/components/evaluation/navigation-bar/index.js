import React, { PropTypes } from 'react';
import {
  ButtonGroup,
  Button,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
// import renderIf from 'render-if';
import moment from 'moment';

import { withTimeSyncronizer } from '../../time-syncronizer';

const Section = ({ active, disabled, children, onClick, tooltip, ...props }) => {
  const element = (
    <ButtonGroup {...props}>
      <Button
        style={styles.tab}
        href="#"
        bsStyle={active ? 'primary' : 'default'}
        active={active}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </ButtonGroup>
  );

  if (tooltip) {
    return (
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip id="question-tooltip">{tooltip}</Tooltip>}
      >
        {element}
      </OverlayTrigger>
    );
  } else return element;
};

Section.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.any,
  onClick: PropTypes.func,
  tooltip: PropTypes.any,
};

const HorizontalNavigationBar = ({
  sections,
  evaluation,
  attendance,
  selected,
  canEdit,
  onClick,
  getTime,
  ...props,
}) => {
  const now = getTime();

  const filtered = sections.filter(section => {
    // Remove Recorrection section to students
    if (!canEdit && section.name === 'Recorrection') return false;
    return true;
  }).map(section => {
    const active = selected === section.path;
    // const url = `/evaluations/show/${evaluation.id}/${section.path}`;

    let disabled = false;
    let tooltip = null;
    if (attendance && section.name === 'Results' && !canEdit) {
      // In 'ms'
      const duration = evaluation.duration;
      // // When the evaluation can be started
      const startAt = moment(evaluation.startAt);
      // // When the evaluation finish
      const finishAt = moment(evaluation.finishAt);
      // // When the user started
      const startedAt = moment(attendance.startedAt);
      // // The user deadline
      const finishedAt = startedAt.isValid() ? moment.min(finishAt, startedAt.clone().add(duration, 'ms')) : finishAt;
      // // We are in the valid range
      const isOpen = now.isBetween(startAt, finishAt);
      // // We passed our or the global deadline
      const isOver = now.isAfter(finishedAt);
      // EDIT is disabled if can't edit and has not started yet or did finish
      disabled = (isOpen || !isOver);
      if (isOpen) tooltip = 'Evaluation is open';
      if (!isOver) tooltip = "Evaluation isn't over";
    }
    if (attendance && section.name === 'Questions' && !canEdit) {
      // In 'ms'
      const duration = evaluation.duration;
      // // When the evaluation can be started
      const startAt = moment(evaluation.startAt);
      // // When the evaluation finish
      const finishAt = moment(evaluation.finishAt);
      // // When the user started
      const startedAt = moment(attendance.startedAt);
      // // The user deadline
      const finishedAt = startedAt.isValid() ? moment.min(finishAt, startedAt.clone().add(duration, 'ms')) : finishAt;
      // // We are in the valid range
      const isOpen = now.isBetween(startAt, finishAt);
      // // We passed our or the global deadline
      const isOver = now.isAfter(finishedAt);
      // // We started the evaluation before
      const isStarted = startedAt.isValid();
      // is disabled if can't edit and has not started yet or did finish
      disabled = (!isOpen || !(isOpen && isStarted && !isOver));

      if (isOver) tooltip = 'Evaluation is over';
      else if (isOpen && !isStarted) tooltip = 'You must start the evaluation first';
      else if (!isOpen) tooltip = `You must wait till ${startAt.format('MMMM Do, h:mm:ss')} to start`;
    }
    return { ...section, active, disabled, tooltip };
  });

  return (
    <ButtonGroup justified {...props}>
      {filtered.map((section, i) => {
        const { name, description, ...ps } = section;
        return (
          <Section key={i} onClick={() => onClick(section)} {...ps}>
            <h5 style={styles.tabTitle}>{name}</h5>
            <small style={styles.tabDescription}>{description}</small>
          </Section>
        );
      })}
    </ButtonGroup>
  );
};

HorizontalNavigationBar.propTypes = {
  sections: PropTypes.array,
  evaluation: PropTypes.object,
  attendance: PropTypes.object,
  selected: PropTypes.string,
  canEdit: PropTypes.bool,
  onClick: PropTypes.func,
  getTime: PropTypes.func,
};

export default withTimeSyncronizer({ ticks: 3 })(HorizontalNavigationBar);

const styles = {
  tab: {
    fontSize: 14,
    lineHeight: 1,
    verticalAlign: 'top',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    paddingBottom: 12,
  },
  tabTitle: {
    marginTop: 4,
    marginBottom: 2,
  },
  tabDescription: {

  },
};
