const checkIfPublicityMember = (id: number) => {
  const publicityMembers = [404, 533, 538, 2721, 2941, 95];
  return publicityMembers.find((memberId) => memberId === id);
};
export default checkIfPublicityMember;
