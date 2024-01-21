const checkIfAccommodationMember = (id: number) => {
    const accommodationMembers = [404, 533, 538, 2721, 2941, 95];
    return accommodationMembers.find((memberId) => memberId === id);
  };
  export default checkIfAccommodationMember;
  