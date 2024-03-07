import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  page: {
    marginBottom: '96px',
    padding: '24px'
  },
}));

// API key from NewsAPI
const API_KEY = 'f0b6a3c7a3b64ff1b925103d09562bcb'; 

function NewsFeed() {
  const classes = useStyles();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      const url = `https://newsapi.org/v2/top-headlines?country=us${category ? `&category=${category}` : ''}&apiKey=${API_KEY}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
       fetchNews();
    }, [category]);

  return (
    <div className={classes.page}>
        <select onChange={(e) => setCategory(e.target.value)} value={category}>
            <option value="">All</option>
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="sports">Sports</option>
            <option value="entertainment">Entertainment</option>
            <option value="general">General</option>
            <option value="health">Health</option>
            <option value="science">Science</option> 
            <option value="technology">Technology</option>             
        </select>
        <div>
            {articles.map((article, index) => (
                <div key={index}>
                    <h2>{article.title}</h2>
                    <p>{article.description}</p>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
                </div>
            ))}
        </div>
    </div>
  );
}

export default NewsFeed;