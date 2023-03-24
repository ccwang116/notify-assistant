const tracks = require("../services/tracks.service");

async function get(req, res, next) {
  try {
    const result = await tracks.get();
    if (result.status === 200) {
      const list = result.data;
      res.render("stock", {
        initialValue: { stockId: "", tracePrice: "" },
        title: "Stock Tracker",
        results: list,
        form_action: "/tracks",
      });
    }
  } catch (err) {
    console.error(`Error while creating`, err);
    next(err);
  }
}
async function create(req, res, next) {
  try {
    const result = await tracks.create(req.body);
    if (result.status === 201) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while creating`, err);
    next(err);
  }
}

async function deletePrice(req, res, next) {
  try {
    const result = await tracks.deletePrice(
      req.params.priceList,
      req.params.price,
      req.params.id
    );
    if (result.status === 200) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while deletePrice`, err.message);
    next(err);
  }
}
async function addPrice(req, res, next) {
  try {
    const result = await tracks.addPrice(
      req.params.priceList,
      req.body.tracePrice,
      req.params.id
    );
    if (result.status === 200) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while addPrice`, err.message);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await tracks.remove(req.params.id);
    if (result.status === 200) {
      res.redirect("/stock");
    }
  } catch (err) {
    console.error(`Error while deleting `, err.message);
    next(err);
  }
}

module.exports = {
  get,
  create,
  deletePrice,
  addPrice,
  remove,
};
