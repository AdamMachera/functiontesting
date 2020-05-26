namespace EntityState.Services
{
    public class SimpleValueValidator : ISimpleValueValidator
    {
        public bool Validate(int value)
        {
            if (value > 1000)
            {
                return false;
            }

            return true;
        }
    }
}
