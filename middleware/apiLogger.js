const apiLogger = (req, res, next) => {
  const typeStatus = req.typeStatus || "GENERAL_API";
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    let color;
    if (status >= 500)
      color = "\x1b[31m"; // red
    else if (status >= 400)
      color = "\x1b[33m"; // yellow
    else if (status >= 200)
      color = "\x1b[32m"; // green
    else color = "\x1b[0m"; // reset
    const reset = "\x1b[0m";
    const statusMessage =
      res.statusMessage || require("http").STATUS_CODES[status] || "";
    console.log(
      ` ${req.method} ${req.originalUrl} ${color}${status}${reset} ${statusMessage} ${ms}ms`
    );
  });

  next();
};

module.exports = apiLogger;
