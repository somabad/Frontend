import React, { Fragment, useState, useEffect, useCallback, useContext } from 'react';
import { Form, Row } from 'reactstrap';
import { X } from 'react-feather';
import { Link } from 'react-router-dom';
import CustomContext from '../../_helper/Customizer';
import Leftbar from './Leftbar/index';
import RightHeader from './RightHeader/index';
import { getMenuItems } from '../Sidebar/Menu';
import { Loading } from '../../Constant/indexmy';
import SvgIcon from '../../Components/Common/Component/SvgIcon';

const Header = () => {
  const id = window.location.pathname.split('/').pop();
  const layout = id;
  const { toggleIcon, customizer } = useContext(CustomContext);
  const layout_type = customizer.settings.layout_type;

  const [mainMenu, setMainMenu] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const [searchResultEmpty, setSearchResultEmpty] = useState(false);

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      removeFix();
    }
  }, []);

  useEffect(() => {
    setMainMenu(getMenuItems());
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);
    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  const handleSearchKeyword = (keyword) => {
    setSearchValue(keyword);

    if (!keyword) {
      removeFix();
      return;
    }

    const search = keyword.toLowerCase();
    const items = [];

    mainMenu.forEach((menu) => {
      menu.Items.forEach((item) => {
        if (item.title.toLowerCase().includes(search) && item.type === 'link') {
          items.push(item);
        }
      });
    });

    setSearchItems(items);
    checkSearchResultEmpty(items);
    addFix();
  };

  const checkSearchResultEmpty = (items) => {
    if (!items.length) {
      setSearchResultEmpty(true);
      document.querySelector('.empty-menu')?.classList.add('is-open');
    } else {
      setSearchResultEmpty(false);
      document.querySelector('.empty-menu')?.classList.remove('is-open');
    }
  };

  const addFix = () => {
    document.querySelector('.Typeahead-menu')?.classList.add('is-open');
    document.body.classList.add(`${layout_type}`);
  };

  const removeFix = () => {
    setSearchValue('');
    setSearchItems([]);
    document.querySelector('.Typeahead-menu')?.classList.remove('is-open');
    document.body.classList.add(`${layout_type}`);
    document.body.classList.remove('offcanvas');
  };

  return (
    <Fragment>
      <div className={`page-header ${toggleIcon ? 'close_icon' : ''}`}>
        <Row className='header-wrapper m-0'>
          <Form className='form-inline search-full col' action='#' method='get'>
            <div className='form-group w-100'>
              <div className='Typeahead Typeahead--twitterUsers'>
                <div className='u-posRelative'>
                  <input
                    className='Typeahead-input form-control-plaintext w-100'
                    id='demo-input'
                    type='search'
                    placeholder='Search Cuba ..'
                    value={searchValue}
                    onChange={(e) => handleSearchKeyword(e.target.value)}
                  />
                  <div className='spinner-border Typeahead-spinner' role='status'>
                    <span className='sr-only'>{Loading}</span>
                  </div>
                  <X className='close-search' onClick={removeFix} />
                </div>
                <div className='Typeahead-menu' id='search-outer'>
                  <div className='header-search-suggestion custom-scrollbar'>
                    {searchItems.map((data, index) => (
                      <div className='ProfileCard u-cf' key={index}>
                        <div className='ProfileCard-details'>
                          <div className='ProfileCard-realName'>
                            <Link
                              to={`${data.path}/${layout}`}
                              className='realname w-100 d-flex justify-content-start gap-2'
                              onClick={removeFix}
                            >
                              <SvgIcon style={{ width: '16px', height: '16px' }} className='stroke-icon' iconId={`stroke-${data.icon}`} />
                              <SvgIcon style={{ width: '16px', height: '16px' }} className='fill-icon' iconId={`fill-${data.icon}`} />
                              {data.title}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='Typeahead-menu empty-menu'>
                  {searchResultEmpty && (
                    <div className='tt-dataset tt-dataset-0'>
                      <div className='EmptyMessage'>Oops!! There are no result found.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Form>
          <Leftbar />
          <RightHeader />
        </Row>
      </div>
    </Fragment>
  );
};

export default Header;
