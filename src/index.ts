import { greetUser } from '$utils/greet';

window.Webflow ||= [];
window.Webflow.push(() => {
  const name = 'Creative Developer :DEV. Dashboard';
  greetUser(name);
});
