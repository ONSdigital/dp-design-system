import { findNode } from '../utilities';

document.addEventListener('DOMContentLoaded', () => {
  function attachAction(actionsList, selector, handler) {
    const actionNode = findNode(
      actionsList,
      `:scope ${selector}`,
    );
    if (!actionNode) {
      console.warn(`attachAction() No node found for "${selector}"`); // eslint-disable-line
      return;
    }

    actionNode.addEventListener('click', handler);
  }

  function attachPageActions(actionsListSelector) {
    const actionsList = findNode(actionsListSelector);
    if (!actionsList) {
      console.warn('attachPageActions() No actions list found'); // eslint-disable-line
      return;
    }

    attachAction(actionsList, '.page-action--print', (event) => {
      event.preventDefault();
      window.print();
    });

    attachAction(actionsList, '.page-action--copy-link', (event) => {
      event.preventDefault();
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(window.location.href)
          .catch(console.error); // eslint-disable-line
      }
    });
  }

  if (findNode('.bulletin')) {
    attachPageActions('.bulletin .page-actions');
  }
});
