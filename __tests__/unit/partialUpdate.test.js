const request = require("supertest");
process.env.NODE_ENV = 'test';

const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      const queryObj = sqlForPartialUpdate(
        'users',
        { 'username': 'user1', 'first_name': 'brad' },
        'userId',
        '1'
      );

      // FIXME: write real tests!
      expect(queryObj.query).toBe(
        `UPDATE users SET username=$1, first_name=$2 WHERE userId=$3 RETURNING *`
      );
      expect(queryObj.values).toEqual(['user1', 'brad', '1']);
    });
});
