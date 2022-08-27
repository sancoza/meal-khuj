import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useQuery } from 'react-query';
import { BeatLoader } from 'react-spinners';
import Image from 'next/image';
import { FaHeartBroken, FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import classes from './singleMeal.module.scss';
import Title from '../../components/text/Title';
import PointText from '../../components/text/PointText';
import IngredientsTable from '../../components/mealsPage/IngredientsTable';
import { Button } from '../../components/button/Button';

const getSingleMeal = async ({ queryKey }) => {
  const { data } = await axios.get(`/lookup.php?i=${queryKey[1]}`);
  return data?.meals[0];
};

function SingleMeals() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, isError } = useQuery(['singleMeal', id], getSingleMeal);
  const [isSaved, setIsSaved] = React.useState(false);

  useEffect(() => {
    if (localStorage.getItem('savedMeals')) {
      const savedMeals = JSON.parse(localStorage.getItem('savedMeals'));
      if (savedMeals.includes(id)) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    }
  }, [id]);

  if (isError) {
    return <div>Error</div>;
  }

  if (isLoading) {
    return (
      <BeatLoader color="#fff" loading={isLoading} size={20} />
    );
  }

  const ingredients = Object.keys(data).filter((key) => key.startsWith('strIngredient')).filter((key) => data[key] !== '' && data[key] !== null);

  // console.log(measures.map((key) => data[key]));
  const ingredientsWithMeasures = ingredients.map((key, index) => ({
    index: index + 1,
    ingredient: data[key],
    measure: data[`strMeasure${index + 1}`],
  }));

  const handleSaveButtonClick = async () => {
    if (localStorage.getItem('savedMeals') === null) {
      localStorage.setItem('savedMeals', JSON.stringify([data.idMeal]));
      toast.success('Meal saved successfully');
      setIsSaved(true);
    } else {
      const savedMeals = JSON.parse(localStorage.getItem('savedMeals'));
      if (!isSaved) {
        savedMeals.push(data.idMeal);
        localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
        toast.success('Meal saved successfully');
        setIsSaved(true);
      } else {
        savedMeals.splice(savedMeals.indexOf(data.idMeal), 1);
        localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
        setIsSaved(false);
        toast.error('Meal Removed successfully');
      }
    }
  };

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.topContainer}>
        <div className={classes.img}>
          <Image src={data.strMealThumb} height={300} width={300} />
        </div>
        <div className={classes.info}>
          <Title variant="primary">{data.strMeal}</Title>
          <PointText className={classes.infoText}>
            Category:
            {' '}
            {data.strCategory}
          </PointText>
          <PointText className={classes.infoText}>
            Area:
            {' '}
            {data.strArea}
          </PointText>
          <PointText className={classes.infoText}>
            tags:
            {' '}
            {data.strTags.split(',').join(', ')}
          </PointText>
          <Button variant="primary" className={classes.saveButton} onClickHandler={handleSaveButtonClick}>
            {isSaved ? (
              <>
                <FaHeartBroken />
                {' '}
                Remove
              </>
            ) : (
              <>
                <FaHeart className={classes.saveIcon} />
                { ' '}
                save
              </>
            ) }
          </Button>
        </div>
      </div>
      <div className={classes.ingredientsTable}>
        <IngredientsTable ingredientsWithMeasures={ingredientsWithMeasures} />
      </div>
      <div className={classes.instructions}>
        <Title>Instructions</Title>
        {data.strInstructions.split('.').filter((sentence) => sentence !== '').map((sentence) => (
          <PointText>
            {sentence}
            .
          </PointText>
        ))}
      </div>
    </div>
  );
}

export default SingleMeals;