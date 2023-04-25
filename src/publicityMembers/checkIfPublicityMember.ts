const publicityMembers = [404, 533, 538, 2721, 2941, 95];
let flag = 0;

const checkIfPublicityMember = (id: number) => {
  publicityMembers.map((member) => {
    if (member === id) flag = 1;
  });
  if (flag === 1) return true;
  return false;
};
export default checkIfPublicityMember;
