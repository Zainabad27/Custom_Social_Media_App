// function async_handler(fn) {
//     return async function (req, res, next) {
//         try {
//             await fn(req, res, next);
//         } catch (error) {
//             next(error); // send to global error handler
//         }
//     };
// }


//professional syntax:

const async_handler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch((err) => next(err));
  };
}




export { async_handler }