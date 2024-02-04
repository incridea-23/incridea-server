const checkIfAccommodationMember = (id: number) => {
    const accommodationMembers = [1, 2, 3, 14];
    return accommodationMembers.find((memberId) => memberId === id);
  };
  export default checkIfAccommodationMember;
  