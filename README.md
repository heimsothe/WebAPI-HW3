# WebAPI Assignment 3
**Author:** Elijah Heimsoth
**Class:** CSCI 3916 — Web API
**Date:** 03/29/26

## Deployed Endpoints
- **API:** [https://webapi-hw3.onrender.com](https://webapi-hw3.onrender.com)
- **React App:** [https://webapi-hw3-react-heimsoth.onrender.com](https://webapi-hw3-react-heimsoth.onrender.com)

## API Routes
| Route                   | GET                            | POST                | PUT                   | DELETE                |
| ----------------------- | ------------------------------ | ------------------- | --------------------- | --------------------- |
| /movies                 | Return all movies              | Save a single movie | Not supported         | Not supported         |
| /movies/:movieparameter | Return specific movie by title | Not supported       | Update movie by title | Delete movie by title |


All routes require JWT authentication. Obtain a token via `POST /signin`.

## Postman Collection
- [Collection JSON](Postman/CSC3916_HW3.postman_collection.json)
- [Environment JSON](Postman/HEIMSOTH%20-%20HW3.postman_environment.json)

### Collection Details
| #   | Request                     | Method                | Expected Status |
| --- | --------------------------- | --------------------- | --------------- |
| 1   | Signup (random user)        | POST /signup          | 201             |
| 2   | Signin (get JWT token)      | POST /signin          | 200             |
| 3   | Save a movie                | POST /movies          | 201             |
| 4   | Get all movies              | GET /movies           | 200             |
| 5   | Get specific movie          | GET /movies/:title    | 200             |
| 6   | Update a movie              | PUT /movies/:title    | 200             |
| 7   | Delete a movie              | DELETE /movies/:title | 200             |
| 8   | Error: Duplicate signup     | POST /signup          | 409             |
| 9   | Error: Missing movie fields | POST /movies          | 400             |
| 10  | Error: Too few actors       | POST /movies          | 400             |
| 11  | Error: Nonexistent movie    | GET /movies/:title    | 404             |
| 12  | Error: No auth              | GET /movies           | 401             |


### How to Run
1. Import both JSON files into Postman
2. Select the **HEIMSOTH - HW3** environment
3. Run the collection — all 12 requests / 24 tests should pass