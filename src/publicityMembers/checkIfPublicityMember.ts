const publicityMembers = [404,533,538];

const checkIfPublicityMember = (id: number) => {
    publicityMembers.map((member) => {
        if(member !== id)
            return false;
    })
    return true;
}
export default checkIfPublicityMember;