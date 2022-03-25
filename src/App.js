import React, { useState, useEffect } from 'react';
import { ReactDOM } from 'react-dom';

 //TODO: fix flex layout (cards smooshed to each other no buenos)
const Header = () => {
  return (
    <header className="text-md-center my-5 px-4">
      <h1 className="center font-weight-bolder mt-4 mb-3">GitHub Repo Comparison</h1>
      <h5 className="mb-0">
        Take your favourite repositories head-to-head!
      </h5>
    </header>
  )
}

const RepoComparator = (props) => {
  const [repoLeft, setRepoLeft] = useState(props.repos[0]);
  const [repoRight, setRepoRight] = useState(props.repos[1]);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [scoresToDisplay, setScoresToDisplay] = useState([]);
 
  const declareWinner = (repoLT, repoRT) =>  {
    const SCORE_CATEGORIES = [
       "stargazers_count", 
       "watchers", 
       "forks", 
       "open_issues"
     ];
    const scores = [];
    let tempLeftScore = 0;
    let tempRightScore = 0;
    
    for (let i = 0; i < SCORE_CATEGORIES.length; i++) {
      const category = SCORE_CATEGORIES[i];
      if (repoLT[category] > repoRT[category]) {
        tempLeftScore++;
        scores.push('1 – 0');

      } else if (repoLT[category] < repoRT[category]) {
        tempRightScore++;
        scores.push('0 – 1');
      } else {
        tempLeftScore++;
        tempRightScore++;
        scores.push('1 – 1');
      }
    }  
    setScoresToDisplay(scores);
      
    if (tempLeftScore > tempRightScore) {
      return 0;
    } else if (tempLeftScore < tempRightScore) {
      return 1
    } else {
      return null
    }
  }
  
  // https://reactjs.org/docs/hooks-effect.html#tip-use-multiple-effects-to-separate-concerns
  const [winnerRepo, setWinnerRepo] = useState(null);
  useEffect(() => {
    setWinnerRepo(declareWinner(repoLeft, repoRight))
  }, [repoLeft, repoRight])

  // TODO: can we be more defensive about the text in the input? So that we don't rely on users having to type https://api.github.com/repos/
  const fetchNewRepo = (index, searchText) => {
    fetch(`${BASE_URL}${searchText}`) 
      .then(res => res.json())
      .then(repoData => {
        setFetchFailed(false)
        if (index === 0) {
          setRepoLeft(repoData)
        } else if (index === 1) {
          setRepoRight(repoData)
        }
      })
      .catch(error => {
        setFetchFailed(true)
        console.log(error.message)
      })
   }

   // TODO: is this the best way to go about conditional rendering?? How do we show something went wrong with the fetch?
    if (fetchFailed) {
      return (
        <div>Bad</div>
      )
    }
    
    return (
      <section className="container">
        <div className="row justify-content-around">
            <SearchableRepoCard 
              key={`${repoLeft.full_name}-${repoLeft.html_url}`}
              index={0}
              repo={repoLeft} 
              fetchNewRepo={fetchNewRepo}
              isWinner={winnerRepo === 0 ? true : false}
             />
          <SearchableRepoCard 
              key={`${repoRight.full_name}-${repoRight.html_url}`}
              index={1}
              repo={repoRight} 
              fetchNewRepo={fetchNewRepo}
              isWinner={winnerRepo === 1 ? true : false}
             />
          <ScoreDisplay scoresToDisplay={scoresToDisplay} />  
        </div>
       </section>
     )
}

const ScoreDisplay = (props) => {
  return (
    <div className="col-md-5 text-center">
       {props.scoresToDisplay.map(score => <p>{score}</p>)}
    </div>
  )
}

const SearchableRepoCard = (props) => {
 const { repo } = props; 

  return (
    <article 
      className="col-md-5 shadow p-5 mx-3 mb-4 rounded bg-white d-flex flex-column">
      <RepoSearchForm 
        url={repo.url} 
        fetchNewRepo={props.fetchNewRepo} 
        index={props.index} 
      />
      <RepoCard 
        repo={repo} 
        isWinner={props.isWinner} 
      />
    </article>
  )
}

const RepoSearchForm = (props) => {
  const searchTextRef = React.createRef(null);
  
  const handleSubmit = (event) => {
    const searchTextNode = searchTextRef.current;
    props.fetchNewRepo(props.index, searchTextNode.value);
    event.preventDefault();
  }
  
  // Look into vanity URL component from Bootstrap: https://getbootstrap.com/docs/5.0/forms/input-group/
    return (
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between mb-3">
          <div className="flex-fill">
            <label htmlFor="repo-url" 
              className="col-sm-2 col-form-label visually-hidden">    
            </label>
            <input 
              type="text" 
              className="form-control"
              defaultValue={props.url}
              id="repo-url"  
              ref={searchTextRef}
            />
          </div>
          <div className="flex-grow-1">
            <button type="submit" className="btn btn-primary w-100">Go</button>
          </div>
        </div>
      </form>
    );
}

const RepoCard = (props) => {
    const { repo, isWinner } = props;

    return (
      <div className="d-flex flex-column h-100">
        <div className="d-flex align-items-center mt-3">
          <h3>
            <a href={repo.html_url} target="_blank" 
               className="text-decoration-none">
              {repo.full_name}
            </a>
          </h3>  
          <p className="mb-0 mr-2">{isWinner ? '🥇' : '🥈' }</p>
        </div>
        <p className="text-muted">{repo.description}</p>
        <ul className="mt-auto">
          <li>⭐️ <strong>{repo.stargazers_count}</strong></li>
          <li>👀 {repo.watchers}</li>
          <li>🍴{repo.forks}</li>
          <li> {repo.open_issues}</li>
        </ul>
      </div>
    )
}

const App = () => {
  return (
    <div className="container vh-100 d-flex flex-column">
      <Header />
      <RepoComparator repos={SEED_REPOS} />  
    </div>  
  ) 
};

// Constants...Inc array of SEED_REPOS to use as seed data on initial render
const BASE_URL = "https://api.github.com/repos/";
const SEED_REPOS = [
    {
      full_name: 'facebook/react', 
      description: 'A declarative, efficient, and flexible JS library for building UIs.',
      url: 'facebook/react',
      html_url: "https://github.com/facebook/react",
      stargazers_count: 166143, 
      watchers: '6,733',
      forks: '33,358', 
      open_issues: '10,179'
  
    }, 
    {
      full_name: 'vuejs/vue', 
      description: '🖖 Vue.js is a progressive, incrementally-adoptable JS framework for building UI on the web.',
      url: 'vuejs/vue',
      html_url: 'https://github.com/vuejs/vue',
      stargazers_count: 181252, 
      watchers: '7,252',
      forks: '28,567', 
      open_issues: '541'
    }
  ];

export default App;
