import { greetUser } from '$utils/greet';

window.Webflow ||= [];
window.Webflow.push(() => {
  const name = 'Creative Developer : Dashboard';
  greetUser(name);
});
