import SmallProduct from '~/components/features/product/product-sm';

function ProductsSidebar(props) {
  const { adClass = '', type = 'right', featured, deliveryMethods } = props;
  const loading = false;

  return (
    <aside className={`col-lg-3 sidebar-fixed sticky-sidebar-wrapper ${adClass} ${type === 'left' ? 'sidebar' : 'right-sidebar'}`}>
      {loading ? (
        <div className="widget-2"></div>
      ) : (
        <div className="sticky-sidebar">
          <div className="service-list mb-4">
            {deliveryMethods.map((method) => (
              <div className="icon-box icon-box-side icon-box3" key={method._id}>
                <div className="icon-box-content">
                  <span className="icon-box-title text-capitalize">{method.name}</span>
                  <p>{method.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="widget widget-products widget-collapsible">
            <span className="widget-title mb-3 lh-1 text-capitalize d-block text-dark">Похожие товары</span>

            <ul className="widget-body mb-0">
              <div className="products-col_gap">
                {featured.slice(0, 4).map((product, index) => (
                  <SmallProduct product={product} key={'small-product-' + index}/>
                ))}
              </div>
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}

export default ProductsSidebar;
