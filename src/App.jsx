import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSearch, searchBrands, searchOffers, selectBrand } from "./partsSlice";

function App() {
  const dispatch = useDispatch();
  const { brands, selectedBrand, brandsStatus, brandsError, offers, offersStatus, offersError } = useSelector(
    (state) => state.search,
  );
  const [number, setNumber] = useState("");

  useEffect(() => {
    if (!number.trim()) return undefined;

    let request;
    const timer = setTimeout(() => {
      request = dispatch(searchBrands({ number: number.trim() }));
    }, 500);

    return () => {
      clearTimeout(timer);
      request?.abort();
    };
  }, [dispatch, number]);

  useEffect(() => {
    if (!selectedBrand || !number.trim()) return undefined;
    const request = dispatch(searchOffers({ number: number.trim(), brand: selectedBrand }));
    return () => request.abort();
  }, [dispatch, number, selectedBrand]);

  function updateNumber(value) {
    dispatch(clearSearch());
    setNumber(value);
  }

  const ready = Boolean(number.trim());

  return (
    <main className="min-vh-100 bg-light py-4 py-md-5">
      <div className="container" style={{ maxWidth: 900 }}>
        <header className="mb-4">
          <h1 className="h2 mb-2">Поиск автозапчастей и аналогов</h1>
          <p className="text-secondary mb-0">Введите артикул, затем выберите производителя для просмотра предложений.</p>
        </header>

        <section className="card shadow-sm border-0 mb-4" aria-labelledby="search-title">
          <div className="card-body p-4">
            <h2 className="h5 mb-4" id="search-title">
              Поиск по артикулу
            </h2>
            <div className="row g-3">
              <div className="col-md-7">
                <label htmlFor="part-number" className="form-label">
                  Артикул детали
                </label>
                <input
                  id="part-number"
                  type="text"
                  className="form-control"
                  autoComplete="off"
                  value={number}
                  onChange={(event) => updateNumber(event.target.value)}
                  placeholder="Например, 01089"
                />
              </div>
            </div>
            <p className="small text-secondary mt-3 mb-0">Поиск начнётся автоматически через полсекунды после ввода.</p>
          </div>
        </section>

        {ready && (brandsStatus === "idle" || brandsStatus === "loading") && (
          <div className="d-flex align-items-center gap-2 text-secondary mb-4" role="status">
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
            <span>Ищем производителей…</span>
          </div>
        )}

        {ready && brandsStatus === "error" && (
          <div className="alert alert-danger" role="alert">
            <div>{brandsError}</div>
          </div>
        )}

        {ready && brandsStatus === "success" && (
          <section className="card shadow-sm border-0" aria-labelledby="brands-title">
            <div className="card-body p-4">
              <h2 className="h5 mb-3" id="brands-title">
                Производители
              </h2>

              {brands.length === 0 && <p className="text-secondary mb-0">По этому артикулу производители не найдены.</p>}

              {brands.length > 0 && (
                <div className="d-flex flex-wrap gap-2" role="group" aria-label="Выбор производителя">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      className={`btn ${selectedBrand === brand ? "btn-primary" : "btn-outline-primary"}`}
                      aria-pressed={selectedBrand === brand}
                      onClick={() => dispatch(selectBrand(brand))}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {selectedBrand && (
          <section className="card shadow-sm border-0 mt-4" aria-labelledby="offers-title">
            <div className="card-body p-4">
              <h2 className="h5 mb-3" id="offers-title">
                Предложения и аналоги: {selectedBrand}
              </h2>

              {offersStatus === "loading" && (
                <div className="d-flex align-items-center gap-2 text-secondary" role="status">
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                  <span>Загружаем предложения…</span>
                </div>
              )}

              {offersStatus === "error" && (
                <div className="alert alert-danger mb-0" role="alert">
                  <div>{offersError}</div>
                </div>
              )}

              {offersStatus === "success" && offers.length === 0 && (
                <p className="text-secondary mb-0">Предложения и аналоги не найдены.</p>
              )}

              {offersStatus === "success" && offers.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped align-middle mb-0" style={{ tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "50%" }} />
                      <col style={{ width: "25%" }} />
                      <col style={{ width: "25%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col">Название / Производитель</th>
                        <th scope="col" className="text-end">
                          Цена
                        </th>
                        <th scope="col" className="text-end">
                          Остаток на складе
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((offer) => (
                        <tr key={offer.id}>
                          <td>
                            <div>{offer.name}</div>
                            <div className="text-secondary small">{offer.brand}</div>
                          </td>
                          <td className="text-end">{offer.price == null ? "—" : offer.price}</td>
                          <td className="text-end">{offer.stock == null ? "—" : offer.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
