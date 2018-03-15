import { NightwatchBrowser } from 'nightwatch';
import Browser from '../browser';

function execute(selector: string, value: any) {
  const input: any = document.querySelector(selector);
  const lastValue = input.value;
  input.value = value;
  const event = new Event('input', { bubbles: true });

  // hack from https://github.com/facebook/react/issues/11488#issuecomment-347775628
  const tracker = input._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  input.dispatchEvent(event);
}

export function command(selector: string, value: any): Browser {
  const client: Browser = this;
  return client.execute(execute, [selector, '10']);
}
