from storages.backends.s3boto3 import S3Boto3Storage

class BookingAttachmentStorage(S3Boto3Storage):
    bucket_name = 'booking-attachments'
    custom_domain = 'itqhsfuxuhrnbfrcwbbt.supabase.co/storage/v1/object/public/booking-attachments'